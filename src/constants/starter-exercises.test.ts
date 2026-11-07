import { describe, expect, test } from '@jest/globals';

import { muscles, type MuscleChoice } from './muscles';
import { buildStarterExerciseRows, STARTER_EXERCISES } from './starter-exercises';
import {
    shouldSeedStarterCatalogue,
    STARTER_CATALOGUE_VERSION,
} from '../services/starter-catalogue/logic';

const collectMuscleValues = (choices: MuscleChoice[], into: Set<string>) => {
    for (const choice of choices) {
        into.add(choice.value);
        if (choice.choices) collectMuscleValues(choice.choices, into);
    }
};

const validMuscles = new Set<string>();
for (const group of muscles) {
    if (group.value) validMuscles.add(group.value);
    collectMuscleValues(group.choices, validMuscles);
}

describe('starter exercises', () => {
    test('ids are unique and fit the id column', () => {
        const ids = STARTER_EXERCISES.map((item) => item.id);

        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id.length).toBeLessThanOrEqual(21);
    });

    test('names are unique', () => {
        const names = STARTER_EXERCISES.map((item) => item.name.toLowerCase());
        expect(new Set(names).size).toBe(names.length);
    });

    test('every muscle value exists in the muscle tree', () => {
        for (const item of STARTER_EXERCISES) {
            for (const value of [...item.primary, ...(item.secondary ?? [])]) {
                expect({ id: item.id, value, known: validMuscles.has(value) }).toEqual({
                    id: item.id,
                    value,
                    known: true,
                });
            }
        }
    });

    test('every exercise has a primary muscle', () => {
        for (const item of STARTER_EXERCISES) expect(item.primary.length).toBeGreaterThan(0);
    });

    test('rows are system exercises owned by the given user with matching tracking', () => {
        const now = new Date(1700000000000);
        const rows = buildStarterExerciseRows('__skulpt__', now);

        expect(rows).toHaveLength(STARTER_EXERCISES.length);
        for (const row of rows) {
            expect(row.source).toBe('system');
            expect(row.userId).toBe('__skulpt__');
            expect(row.updatedAt).toBe(now);
            expect(row.tracking?.length).toBeGreaterThan(0);
        }

        const plank = rows.find((row) => row.id === 'sx_plank');
        expect(plank?.tracking).toEqual(['time']);

        const assisted = rows.find((row) => row.id === 'sx_asst_pull');
        expect(assisted?.weightAssisted).toBe(true);

        const run = rows.find((row) => row.id === 'sx_run_out');
        expect(run?.tracking).toEqual(['time', 'distance']);
    });
});

describe('shouldSeedStarterCatalogue', () => {
    test('seeds a local-only build that has not been seeded', () => {
        expect(shouldSeedStarterCatalogue(false, undefined)).toBe(true);
    });

    test('does not seed when a sync provider supplies the catalogue', () => {
        expect(shouldSeedStarterCatalogue(true, undefined)).toBe(false);
    });

    test('does not seed again once the current version is stored', () => {
        expect(shouldSeedStarterCatalogue(false, STARTER_CATALOGUE_VERSION)).toBe(false);
        expect(shouldSeedStarterCatalogue(false, STARTER_CATALOGUE_VERSION - 1)).toBe(true);
    });
});
