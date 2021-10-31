export function once<T extends Function>(fn: T): T {
  const sentinel = Symbol();
  let result = sentinel;
  return function (this: any, ...args: any[]): any {
    if (result !== sentinel) {
      return result;
    }
    result = Reflect.apply(fn, this, args);
    return result;
  } as any;
}
