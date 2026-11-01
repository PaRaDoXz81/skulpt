import { describe, expect, test } from '@jest/globals';

import {
    BACKUP_FORMAT,
    BACKUP_VERSION,
    BackupFormatError,
    buildBackupFile,
    decideImportAction,
    parseBackupFile,
    prepareImportRow,
} from './format';

const validFile = () =>
    JSON.stringify(
        buildBackupFile(
            {
                workout: [{ id: 'w1', name: 'Push', user_id: 'old-user' }],
                measurement: [{ id: 'm1', user_id: 'old-user', metric: 'weight', value: 80 }],
            },
            1700000000000,
        ),
    );

const parseError = (text: string) => {
    try {
        parseBackupFile(text);
    } catch (error) {
        return error;
    }
    return null;
};

describe('buildBackupFile', () => {
    test('includes every table, empty when no rows were given', () => {
        const file = buildBackupFile({ workout: [{ id: 'w1' }] }, 5);

        expect(file.format).toBe(BACKUP_FORMAT);
        expect(file.version).toBe(BACKUP_VERSION);
        expect(file.exportedAt).toBe(5);
        expect(file.tables.workout).toHaveLength(1);
        expect(file.tables.exercise_set).toEqual([]);
    });
});

describe('parseBackupFile', () => {
    test('round-trips a file built by buildBackupFile', () => {
        const parsed = parseBackupFile(validFile());

        expect(parsed.tables.workout[0].name).toBe('Push');
        expect(parsed.tables.measurement[0].value).toBe(80);
        expect(parsed.exportedAt).toBe(1700000000000);
    });

    test('rejects text that is not JSON', () => {
        const error = parseError('not json');
        expect(error).toBeInstanceOf(BackupFormatError);
        expect((error as BackupFormatError).code).toBe('invalid');
    });

    test('rejects JSON that is not a Skulpt backup', () => {
        const error = parseError(JSON.stringify({ hello: 'world' }));
        expect((error as BackupFormatError).code).toBe('invalid');
    });

    test('rejects a backup from a newer version', () => {
        const file = { ...JSON.parse(validFile()), version: BACKUP_VERSION + 1 };
        const error = parseError(JSON.stringify(file));
        expect((error as BackupFormatError).code).toBe('newer_version');
    });

    test('rejects rows without an id', () => {
        const file = JSON.parse(validFile());
        file.tables.workout.push({ name: 'No id' });
        expect((parseError(JSON.stringify(file)) as BackupFormatError).code).toBe('invalid');
    });

    test('rejects a table that is not a list', () => {
        const file = JSON.parse(validFile());
        file.tables.workout = { id: 'w1' };
        expect((parseError(JSON.stringify(file)) as BackupFormatError).code).toBe('invalid');
    });

    test('treats missing tables as empty', () => {
        const file = { format: BACKUP_FORMAT, version: 1, tables: {} };
        expect(parseBackupFile(JSON.stringify(file)).tables.workout).toEqual([]);
    });
});

describe('prepareImportRow', () => {
    const columns = new Set(['id', 'name', 'user_id', 'source']);

    test('drops columns the schema does not know', () => {
        const row = prepareImportRow(
            'workout',
            { id: 'w1', name: 'Push', future: 1 },
            columns,
            'me',
        );
        expect(row).not.toHaveProperty('future');
        expect(row.name).toBe('Push');
    });

    test('points user-owned rows at the current user', () => {
        const row = prepareImportRow('workout', { id: 'w1', user_id: 'old' }, columns, 'me');
        expect(row.user_id).toBe('me');
    });

    test('keeps the original owner of catalogue exercises', () => {
        const row = prepareImportRow(
            'exercise',
            { id: 'e1', user_id: 'skulpt', source: 'system' },
            columns,
            'me',
        );
        expect(row.user_id).toBe('skulpt');
    });

    test('re-points user-created exercises', () => {
        const row = prepareImportRow(
            'exercise',
            { id: 'e1', user_id: 'old', source: 'user' },
            columns,
            'me',
        );
        expect(row.user_id).toBe('me');
    });

    test('does not add user_id to tables that are not user scoped', () => {
        const row = prepareImportRow('exercise_set', { id: 's1' }, columns, 'me');
        expect(row).not.toHaveProperty('user_id');
    });
});

describe('decideImportAction', () => {
    test('adds rows that do not exist locally', () => {
        expect(decideImportAction(null, 100)).toBe('add');
        expect(decideImportAction(undefined, 100)).toBe('add');
    });

    test('updates only when the imported row is newer', () => {
        expect(decideImportAction(100, 200)).toBe('update');
        expect(decideImportAction(100, 100)).toBe('skip');
        expect(decideImportAction(200, 100)).toBe('skip');
    });

    test('skips an existing row when the import has no usable timestamp', () => {
        expect(decideImportAction(100, null)).toBe('skip');
    });
});
