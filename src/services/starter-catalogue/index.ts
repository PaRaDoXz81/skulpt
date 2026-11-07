import { buildStarterExerciseRows } from '@/constants/starter-exercises';
import { SKULPT_EXERCISES_USER_ID } from '@/constants/skulpt';
import { db } from '@/db';
import { exercise } from '@/db/schema';
import { storage } from '@/storage';
import { isSyncEnabled } from '@/sync/config';

import {
    shouldSeedStarterCatalogue,
    STARTER_CATALOGUE_VERSION,
    STARTER_CATALOGUE_VERSION_KEY,
} from './logic';

/** Returns how many exercises were offered for insert; existing ids are left untouched. */
export const seedStarterCatalogue = async (): Promise<number> => {
    const seededVersion = storage.getNumber(STARTER_CATALOGUE_VERSION_KEY);
    if (!shouldSeedStarterCatalogue(isSyncEnabled(), seededVersion)) return 0;

    const rows = buildStarterExerciseRows(SKULPT_EXERCISES_USER_ID, new Date());

    await db.transaction(async (tx) => {
        for (const row of rows) {
            await tx.insert(exercise).values(row).onConflictDoNothing();
        }
    });

    storage.set(STARTER_CATALOGUE_VERSION_KEY, STARTER_CATALOGUE_VERSION);

    return rows.length;
};
