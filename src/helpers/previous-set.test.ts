import { describe, expect, test } from '@jest/globals';

import type { ExerciseSelect, ExerciseSetSelect } from '@/db/schema';

import { getPreviousSetAt, getSetTrend } from './previous-set';

const makeExercise = (tracking: string[]) => ({ tracking }) as unknown as ExerciseSelect;

const makeSet = (values: Partial<ExerciseSetSelect>) =>
    ({
        weight: null,
        reps: null,
        time: null,
        distance: null,
        ...values,
    }) as ExerciseSetSelect;

describe('getPreviousSetAt', () => {
    test('matches sets by position', () => {
        const sets = [makeSet({ reps: 10 }), makeSet({ reps: 8 })];
        expect(getPreviousSetAt(sets, 1)).toBe(sets[1]);
    });

    test('returns null when there is no matching set', () => {
        expect(getPreviousSetAt([makeSet({ reps: 10 })], 3)).toBeNull();
        expect(getPreviousSetAt(undefined, 0)).toBeNull();
    });
});

describe('getSetTrend', () => {
    const weightReps = makeExercise(['weight', 'reps']);

    test('is null without a previous set', () => {
        expect(getSetTrend(weightReps, makeSet({ weight: 60, reps: 10 }), null)).toBeNull();
    });

    test('heavier weight is up even when reps drop', () => {
        const current = makeSet({ weight: 65, reps: 6 });
        const previous = makeSet({ weight: 60, reps: 10 });
        expect(getSetTrend(weightReps, current, previous)).toBe('up');
    });

    test('same weight falls back to reps', () => {
        const previous = makeSet({ weight: 60, reps: 10 });
        expect(getSetTrend(weightReps, makeSet({ weight: 60, reps: 8 }), previous)).toBe('down');
        expect(getSetTrend(weightReps, makeSet({ weight: 60, reps: 12 }), previous)).toBe('up');
        expect(getSetTrend(weightReps, makeSet({ weight: 60, reps: 10 }), previous)).toBe('same');
    });

    test('lighter weight is down even when reps rise', () => {
        const current = makeSet({ weight: 55, reps: 15 });
        const previous = makeSet({ weight: 60, reps: 10 });
        expect(getSetTrend(weightReps, current, previous)).toBe('down');
    });

    test('reps-only exercises compare reps', () => {
        const exercise = makeExercise(['reps']);
        expect(getSetTrend(exercise, makeSet({ reps: 12 }), makeSet({ reps: 10 }))).toBe('up');
    });

    test('time-based exercises compare time', () => {
        const exercise = makeExercise(['time']);
        expect(getSetTrend(exercise, makeSet({ time: 30 }), makeSet({ time: 45 }))).toBe('down');
    });

    test('ignores fields the exercise does not track', () => {
        const exercise = makeExercise(['reps']);
        const current = makeSet({ weight: 100, reps: 10 });
        const previous = makeSet({ weight: 50, reps: 10 });
        expect(getSetTrend(exercise, current, previous)).toBe('same');
    });

    test('is null when the current set has no entered values', () => {
        expect(getSetTrend(weightReps, makeSet({}), makeSet({ weight: 60, reps: 10 }))).toBeNull();
    });
});
