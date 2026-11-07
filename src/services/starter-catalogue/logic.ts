/** Bump when STARTER_EXERCISES gains rows so existing installs pick them up. */
export const STARTER_CATALOGUE_VERSION = 1;
export const STARTER_CATALOGUE_VERSION_KEY = 'starter.catalogue.version';

/** Local-only builds have no provider to deliver the maintained catalogue, so seed a starter set. */
export const shouldSeedStarterCatalogue = (
    syncEnabled: boolean,
    seededVersion: number | undefined,
): boolean => !syncEnabled && (seededVersion ?? 0) < STARTER_CATALOGUE_VERSION;
