export function createCompositeKey(...parts: Array<string | number>) {
  return parts.join("::");
}
