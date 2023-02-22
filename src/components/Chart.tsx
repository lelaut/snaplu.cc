import { currency } from "../utils/format";
import { type MonthlyProfit } from "../utils/models";

interface MonthlyProfitChartProps {
  title: string;
  data: MonthlyProfit[];
  width: number;
}

export const MonthlyProfitChart = ({
  title,
  data,
  width,
}: MonthlyProfitChartProps) => {
  const profit = data.map((it) => it.profit);
  const max = Math.max(...profit);
  const median =
    profit.length < 2
      ? profit[0] ?? 0
      : profit.length % 2 === 0
      ? profit
          .sort((a, b) => a - b)
          .slice(
            Math.floor(profit.length / 2) - 1,
            Math.floor(profit.length / 2) + 1
          )
          .reduce((acc, it) => acc + it, 0) / 2
      : profit.sort((a, b) => a - b)[Math.floor(profit.length / 2)] ?? 0;

  function renderBar(
    key: number,
    color: string,
    colorIntensity: number,
    month: number,
    year: number,
    profit?: number
  ) {
    const profitRelMedian =
      typeof profit === "undefined" ? 0 : (profit / median) * 100;
    const size =
      typeof profit === "undefined" ? 0 : (profit / max) * (width - 100);

    return (
      <li
        key={key}
        className={`flex w-fit rounded-r-full bg-${color}-${colorIntensity} font-mono font-mono text-xs font-bold`}
      >
        <p className="w-fit rounded-r-full bg-neutral-200 py-px pr-3 pl-2 dark:bg-neutral-700">
          {String(month + 1).padStart(2, "0")}/{String(year).slice(2, 4)}
        </p>
        <p
          className={`min-w-min whitespace-nowrap px-2 py-px font-mono tracking-tighter text-${color}-${
            colorIntensity + 200
          }`}
          style={{ width: `${size}px` }}
        >
          {typeof profit === "undefined"
            ? "None"
            : `${currency.format(profit)} - ${profitRelMedian.toFixed(2)}%`}
        </p>
      </li>
    );
  }

  return (
    <div>
      <div className="flex min-w-0 items-center justify-between p-4">
        <h3 className="truncate text-2xl font-bold">{title}</h3>
        <div className="ml-auto">
          <h3 className="ml-auto text-xl font-bold">
            {currency.format(median)}
          </h3>
          <p className="ml-auto w-fit rounded-sm bg-blue-500 px-2 py-px text-xs tracking-wide">
            MEDIAN
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {data
          .sort((a, b) => b.year - a.year || b.month - a.month)
          .map((month, i) =>
            renderBar(
              i,
              i === 0 ? "pink" : "green",
              400,
              month.month,
              month.year,
              month.profit
            )
          )}

        {Array.from(Array(Math.max(0, 5 - data.length)).keys()).map((i) =>
          renderBar(i, "gray", 400, i, 1998)
        )}
      </ul>
    </div>
  );
};
