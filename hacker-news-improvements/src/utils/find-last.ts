export function findLast<T>(
  arr: readonly T[],
  predicate: (value: T, index: number, obj: T[]) => unknown,
  thisArg?: any
): T | undefined {
  for (let i = arr.length - 1; i > 0; i--) {
    const v = arr[i];
    const predicateReturnValue = Reflect.apply(predicate, thisArg, [v, i, arr]);
    if (predicateReturnValue) {
      return v;
    }
  }
  return undefined;
}
