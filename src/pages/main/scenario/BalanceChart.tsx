import React from "react";
import { AreaChart, Card, Title } from "@tremor/react";
import { valueFormatter } from "../../../common/ValueFormatter";
import { ScenarioResult } from "../../../api/sim";

export type BalanceData = {
  [x: string]: string | number;
  date: string;
};

export interface IBalanceData {
  data: BalanceData[];
  categories: string[];
  max: Record<string, number>;
}

export const formatResultsForBalanceChart = (
  results: ScenarioResult,
  invested: boolean,
): IBalanceData => {
  // map of date to balances
  let balanceChartData: Record<string, BalanceData> = {};
  let max: Record<string, number> = {};

  // for each account, add the data to balanceChartData, creating a
  // new entry for date if necessary
  for (const account in results) {
    max[account] = 0;

    let series = results[account][invested ? "balances" : "uninvested_balances"];
    
    series.forEach((balance) => {
      if (!balanceChartData[balance.date]) {
        balanceChartData[balance.date] = { date: balance.date };
        balanceChartData[balance.date] = { date: balance.date };
      }
      
      balanceChartData[balance.date][account] = balance.balance;
      
      if (balance.balance > max[account]) {
        max[account] = balance.balance;
      }
    });

    let otherSeries = results[account][invested ? "uninvested_balances" : "balances"];
    otherSeries.forEach((balance) => {
      if (balance.balance > max[account]) {
        max[account] = balance.balance;
      }
    });
  }

  // convert balanceChartData to an array
  let balanceChartDataArray = Object.values(balanceChartData);

  return {
    data: balanceChartDataArray,
    categories: Object.keys(results),
    max
  };
};

const BalanceChart: React.FC<IBalanceData> = ({ data, categories, max }) => {
  const colors = Array.from({ length: categories.length }, (_, index) => {
    return [
      "emerald",
      "indigo",
      "fuchsia",
      "amber",
      "lime",
      "violet",
      "pink",
      "yellow",
    ][index % 8];
  });
  return (
    <Card className="h-auto">
      <Title>Total Balance Over Time</Title>
      <AreaChart
        className="h-[400px]"
        showAnimation={true}
        data={data}
        index="date"
        stack={true}
        yAxisWidth={70}
        maxValue={Object.values(max).reduce((a, b) => a + b, 0)}
        categories={categories}
        colors={colors}
        valueFormatter={valueFormatter}
      />
    </Card>
  );
};

export default BalanceChart;
