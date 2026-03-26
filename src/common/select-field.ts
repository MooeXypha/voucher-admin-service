export function getSelectFields<T = Record<string, any>>(
  selectField: string | undefined,
  allowedColumns: string[],
): T | undefined {
  if (!selectField) return undefined;

  const selectColumns = selectField
    .split(',')
    .map((col) => col.trim())
    .filter((col) => allowedColumns.includes(col));

  if (selectColumns.length === 0) return undefined;

  const selectObject = selectColumns.reduce(
    (acc, col) => {
      acc[col] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return selectObject as T;
}
