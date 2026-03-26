export function getOrderBy(value: string) {
  console.log('sort :>> ', value);
  if (!value) return undefined;

  // Split by `+` to extract field and direction
  const [field, direction = 'asc'] = value.split('__');
  console.log('direction :>> ', direction);
  if (!field || !['asc', 'desc'].includes(direction.toLowerCase())) {
    throw new Error('Invalid orderby format. Use "field asc" or "field desc".');
  }
  console.log({
    [field]: direction,
  });
  return {
    [field]: direction,
  };
}
