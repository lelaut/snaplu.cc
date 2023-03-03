export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

import _dayjs from "dayjs";
import _duration from "dayjs/plugin/duration";
import _relativeTime from "dayjs/plugin/relativeTime";

_dayjs.extend(_duration);
_dayjs.extend(_relativeTime);

export const dayjs = _dayjs;

// export { default as dayjs } from "dayjs";

export const bucketKey = (
  userId: string,
  collectionId: string,
  cardId?: string
): string => `card/${userId}/${collectionId}/${cardId ?? ""}`;
