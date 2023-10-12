export function isPrimitive(value: unknown): boolean {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value == null
  );
}
