export const DEFAULT_BAND_NAME = 'Band_01';

export async function seedDefaultBand(tx) {
    await tx.run('INSERT OR IGNORE INTO bands (name) VALUES (?)', [DEFAULT_BAND_NAME]);
}
