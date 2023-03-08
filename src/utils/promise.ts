export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UntilResolveAllOptions {
  retryDelay: number;
}

export async function untilResolveAll<T>(
  promises: Promise<T>[],
  options?: UntilResolveAllOptions
): Promise<T[]> {
  const retryDelay = options?.retryDelay ?? 1000;
  const result: T[] = [];
  let current = promises;

  while (true) {
    (await Promise.allSettled(current)).forEach((promise) => {
      if (promise.status === "fulfilled") {
        result.push(promise.value);
      } else {
        current.push(current[0]!);
      }
      current.shift();
    });

    if (current.length === 0) break;

    await sleep(retryDelay);
  }

  return result;
}
