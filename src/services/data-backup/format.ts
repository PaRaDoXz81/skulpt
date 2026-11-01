export const BACKUP_FORMAT = 'skulpt-backup';
export const BACKUP_VERSION = 1;

export type BackupRow = Record<string, unknown>;

export type BackupTableName =
    'exercise' | 'workout' | 'workout_group' | 'workout_exercise' | 'exercise_set' | 'measurement';

// Import order matters only for readability: foreign keys are not enforced.
export const BACKUP_TABLES: BackupTableName[] = [
    'exercise',
    'workout',
    'workout_group',
    'workout_exercise',
    'exercise_set',
    'measurement',
];

// Tables whose rows belong to the signed-in user and must be re-pointed on import.
const USER_SCOPED_TABLES: ReadonlySet<BackupTableName> = new Set([
    'exercise',
    'workout',
    'measurement',
]);

export interface BackupFile {
    format: typeof BACKUP_FORMAT;
    version: number;
    exportedAt: number;
    tables: Record<BackupTableName, BackupRow[]>;
}

export type BackupErrorCode = 'invalid' | 'newer_version';

export class BackupFormatError extends Error {
    constructor(
        public readonly code: BackupErrorCode,
        message: string,
    ) {
        super(message);
        this.name = 'BackupFormatError';
    }
}

export const buildBackupFile = (
    tables: Partial<Record<BackupTableName, BackupRow[]>>,
    exportedAt: number,
): BackupFile => ({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    tables: Object.fromEntries(
        BACKUP_TABLES.map((name) => [name, tables[name] ?? []]),
    ) as BackupFile['tables'],
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseBackupFile = (text: string): BackupFile => {
    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        throw new BackupFormatError('invalid', 'Backup file is not valid JSON');
    }

    if (!isPlainObject(data) || data.format !== BACKUP_FORMAT) {
        throw new BackupFormatError('invalid', 'Not a Skulpt backup file');
    }

    if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) {
        throw new BackupFormatError('invalid', 'Backup file has no valid version');
    }

    if (data.version > BACKUP_VERSION) {
        throw new BackupFormatError('newer_version', 'Backup file was made by a newer app version');
    }

    if (!isPlainObject(data.tables)) {
        throw new BackupFormatError('invalid', 'Backup file has no tables');
    }

    const tables = {} as BackupFile['tables'];

    for (const name of BACKUP_TABLES) {
        const rows = data.tables[name] ?? [];
        if (!Array.isArray(rows)) {
            throw new BackupFormatError('invalid', `Table "${name}" is not a list`);
        }

        for (const row of rows) {
            if (!isPlainObject(row) || typeof row.id !== 'string' || row.id.length === 0) {
                throw new BackupFormatError('invalid', `Table "${name}" has a row without an id`);
            }
        }

        tables[name] = rows as BackupRow[];
    }

    return {
        format: BACKUP_FORMAT,
        version: data.version,
        exportedAt: typeof data.exportedAt === 'number' ? data.exportedAt : 0,
        tables,
    };
};

/**
 * Keeps only columns that exist in this app's schema (so backups from other schema versions
 * still import) and points user-owned rows at the current user.
 */
export const prepareImportRow = (
    table: BackupTableName,
    row: BackupRow,
    knownColumns: ReadonlySet<string>,
    userId: string,
): BackupRow => {
    const prepared: BackupRow = {};

    for (const [column, value] of Object.entries(row)) {
        if (knownColumns.has(column)) prepared[column] = value;
    }

    // Catalogue exercises are shared across users, so they keep their original owner.
    const isCatalogueExercise = table === 'exercise' && row.source === 'system';

    if (USER_SCOPED_TABLES.has(table) && !isCatalogueExercise) {
        prepared.user_id = userId;
    }

    return prepared;
};

/** Decides what to do with an imported row given the `updated_at` of the local copy, if any. */
export type ImportAction = 'add' | 'update' | 'skip';

export const decideImportAction = (
    localUpdatedAt: number | null | undefined,
    importedUpdatedAt: unknown,
): ImportAction => {
    if (localUpdatedAt == null) return 'add';

    const imported = typeof importedUpdatedAt === 'number' ? importedUpdatedAt : 0;

    return imported > localUpdatedAt ? 'update' : 'skip';
};
