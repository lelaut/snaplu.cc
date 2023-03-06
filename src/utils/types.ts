export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type PartialRecordWithAtLeastOne<
  K extends string | number | symbol,
  V
> = RequireAtLeastOne<Partial<Record<K, V>>, K>;

export type NonEmpty<T> = [T, ...T[]];
