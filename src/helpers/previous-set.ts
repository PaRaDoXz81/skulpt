import type { ExerciseSelect, ExerciseSetSelect } from '@/db/schema';

export type SetTrend = 'up' | 'down' | 'same';

type TrackingField = 'weight' | 'reps' | 'distance' | 'time';

// Most significant metric first: a heavier set beats more reps at a lower weight.
const TREND_PRIORITY: TrackingField[] = ['weight', 'reps', 'distance', 'time'];

const getTracking = (exercise: ExerciseSelect | undefined): TrackingField[] => {
    const tracking: unknown = exercise?.tracking;
    if (!Array.isArray(tracking)) return [];
    return TREND_PRIORITY.filter((field) => tracking.includes(field));
};

/**
 * Picks the previous-session set that lines up with the set at `index`.
 * Sets are matched by position, so the 2nd set today compares with the 2nd set last time.
 */
export const getPreviousSetAt = (
    previousSets: ExerciseSetSelect[] | undefined,
    index: number,
): ExerciseSetSelect | null => previousSets?.[index] ?? null;

/**
 * Compares a set against the matching set from the previous session.
 * Returns null when there is nothing to compare (no previous set or no entered values).
 */
export const getSetTrend = (
    exercise: ExerciseSelect | undefined,
    current: ExerciseSetSelect,
    previous: ExerciseSetSelect | null,
): SetTrend | null => {
    if (!previous) return null;

    let compared = false;

    for (const field of getTracking(exercise)) {
        const now = current[field];
        const before = previous[field];
        if (now == null || before == null) continue;

        compared = true;
        if (now > before) return 'up';
        if (now < before) return 'down';
    }

    return compared ? 'same' : null;
};
