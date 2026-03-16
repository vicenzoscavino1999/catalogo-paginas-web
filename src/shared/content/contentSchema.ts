function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwnKey(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function cloneUnknown<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneUnknown(item)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneUnknown(item)])
    ) as T;
  }

  return value;
}

function describeType(value: unknown): string {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

export function mergeWithDefaults<T>(defaults: T, candidate: unknown): T {
  if (defaults === null) {
    return candidate === null ? (candidate as T) : defaults;
  }

  if (Array.isArray(defaults)) {
    if (!Array.isArray(candidate)) {
      return defaults.map((item) => mergeWithDefaults(item, undefined)) as T;
    }

    if (defaults.length === 0) {
      return cloneUnknown(candidate) as T;
    }

    return candidate.map((item) => mergeWithDefaults(defaults[0], item)) as T;
  }

  if (isPlainObject(defaults)) {
    if (!isPlainObject(candidate)) {
      return Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [key, mergeWithDefaults(value, undefined)])
      ) as T;
    }

    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        mergeWithDefaults(value, hasOwnKey(candidate, key) ? candidate[key] : undefined),
      ])
    ) as T;
  }

  return typeof candidate === typeof defaults ? (candidate as T) : defaults;
}

export function validateWithDefaults(defaults: unknown, candidate: unknown, path: string): string[] {
  const errors: string[] = [];

  function validateNode(example: unknown, current: unknown, currentPath: string) {
    if (example === null) {
      if (current !== null) {
        errors.push(`${currentPath} debe ser null, no ${describeType(current)}.`);
      }
      return;
    }

    if (Array.isArray(example)) {
      if (!Array.isArray(current)) {
        errors.push(`${currentPath} debe ser un array, no ${describeType(current)}.`);
        return;
      }

      if (example.length === 0) {
        return;
      }

      current.forEach((item, index) => {
        validateNode(example[0], item, `${currentPath}[${index}]`);
      });
      return;
    }

    if (isPlainObject(example)) {
      if (!isPlainObject(current)) {
        errors.push(`${currentPath} debe ser un objeto, no ${describeType(current)}.`);
        return;
      }

      Object.entries(example).forEach(([key, value]) => {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;

        if (!hasOwnKey(current, key)) {
          errors.push(`${nextPath} es obligatorio.`);
          return;
        }

        validateNode(value, current[key], nextPath);
      });
      return;
    }

    if (typeof current !== typeof example) {
      errors.push(`${currentPath} debe ser ${describeType(example)}, no ${describeType(current)}.`);
    }
  }

  validateNode(defaults, candidate, path);
  return errors;
}
