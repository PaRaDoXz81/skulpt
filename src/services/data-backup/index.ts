import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { dbConnection } from '@/db';

import {
    BACKUP_TABLES,
    BackupFile,
    BackupRow,
    BackupTableName,
    buildBackupFile,
    decideImportAction,
    parseBackupFile,
    prepareImportRow,
} from './format';

export { BackupFormatError } from './format';

export interface ImportSummary {
    added: number;
    updated: number;
    skipped: number;
}

const OWNED_WORKOUT_IDS = 'SELECT id FROM workout WHERE user_id = ?';
const OWNED_WORKOUT_EXERCISE_IDS = `SELECT id FROM workout_exercise WHERE workout_id IN (${OWNED_WORKOUT_IDS})`;

// Each query only needs `userId` bound once per `?`; see `countParams`.
const EXPORT_QUERIES: Record<BackupTableName, string> = {
    workout: 'SELECT * FROM workout WHERE user_id = ?',
    workout_group: `SELECT * FROM workout_group WHERE workout_id IN (${OWNED_WORKOUT_IDS})`,
    workout_exercise: `SELECT * FROM workout_exercise WHERE workout_id IN (${OWNED_WORKOUT_IDS})`,
    exercise_set: `SELECT * FROM exercise_set WHERE workout_exercise_id IN (${OWNED_WORKOUT_EXERCISE_IDS})`,
    // Own exercises plus any catalogue exercise a workout uses, so a backup stands on its own.
    exercise: `SELECT * FROM exercise WHERE (source = 'user' AND user_id = ?) OR id IN (SELECT exercise_id FROM workout_exercise WHERE workout_id IN (${OWNED_WORKOUT_IDS}))`,
    measurement: 'SELECT * FROM measurement WHERE user_id = ?',
};

const countParams = (query: string) => query.split('?').length - 1;

export const createBackup = async (userId: string): Promise<BackupFile> => {
    const tables: Partial<Record<BackupTableName, BackupRow[]>> = {};

    for (const name of BACKUP_TABLES) {
        const query = EXPORT_QUERIES[name];
        const params = Array.from({ length: countParams(query) }, () => userId);
        tables[name] = await dbConnection.getAllAsync<BackupRow>(query, params);
    }

    return buildBackupFile(tables, Date.now());
};

export const exportBackup = async (userId: string): Promise<void> => {
    const backup = await createBackup(userId);
    const date = new Date(backup.exportedAt).toISOString().slice(0, 10);

    const file = new File(Paths.cache, `skulpt-backup-${date}.json`);
    file.create({ overwrite: true });
    file.write(JSON.stringify(backup));

    await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: file.name,
        UTI: 'public.json',
    });
};

const getColumns = async (table: BackupTableName): Promise<Set<string>> => {
    const info = await dbConnection.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
    return new Set(info.map((column) => column.name));
};

const quote = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

export const importBackup = async (text: string, userId: string): Promise<ImportSummary> => {
    const backup = parseBackupFile(text);
    const summary: ImportSummary = { added: 0, updated: 0, skipped: 0 };

    const columnsByTable = new Map<BackupTableName, Set<string>>();
    for (const name of BACKUP_TABLES) {
        columnsByTable.set(name, await getColumns(name));
    }

    await dbConnection.withTransactionAsync(async () => {
        for (const name of BACKUP_TABLES) {
            const knownColumns = columnsByTable.get(name)!;

            for (const sourceRow of backup.tables[name]) {
                const row = prepareImportRow(name, sourceRow, knownColumns, userId);
                const columns = Object.keys(row);

                const local = await dbConnection.getFirstAsync<{ updated_at: number | null }>(
                    `SELECT updated_at FROM ${name} WHERE id = ?`,
                    [row.id as string],
                );

                const action = decideImportAction(
                    local ? (local.updated_at ?? 0) : null,
                    row.updated_at,
                );

                if (action === 'skip') {
                    summary.skipped += 1;
                    continue;
                }

                const verb = action === 'update' ? 'INSERT OR REPLACE' : 'INSERT OR IGNORE';
                const result = await dbConnection.runAsync(
                    `${verb} INTO ${name} (${columns.map(quote).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
                    columns.map((column) => row[column] as string | number | null),
                );

                if (result.changes > 0) {
                    summary[action === 'update' ? 'updated' : 'added'] += 1;
                } else {
                    // Blocked by a unique constraint (e.g. the same health measurement already exists).
                    summary.skipped += 1;
                }
            }
        }
    });

    return summary;
};
