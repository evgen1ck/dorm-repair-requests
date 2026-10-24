const MAX_DB_ID = 2_147_483_647;

export const isDbId = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= MAX_DB_ID;
