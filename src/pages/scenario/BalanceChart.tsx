import React from "react";
import { AreaChart, Card, Title } from "@tremor/react";
import { valueFormatter } from "../../common/ValueFormatter";
import { ScenarioResult } from "../../api/sim";

export type BalanceData = {
  [x: string]: string | number;
  date: string;
};

export interface IBalanceData {
  data: BalanceData[];
  categories: string[];
}

export const formatResultsForBalanceChart = (
  results: ScenarioResult,
): IBalanceData => {
  
  // map of date to balances
  let balanceChartData: Record<string, BalanceData> = {};
  // for each account, add the data to balanceChartData, creating a 
  // new entry for date if necessary
  for (const account in results) {
    results[account].balances.forEach((balance) => {
      if (!balanceChartData[balance.date]) {
        balanceChartData[balance.date] = { date: balance.date };
      }
      balanceChartData[balance.date][account] = balance.balance;
    });
  }

  // convert balanceChartData to an array
  let balanceChartDataArray = Object.values(balanceChartData);

  return {  
    data: balanceChartDataArray,
    categories: Object.keys(results)
  };
};

const BalanceChart: React.FC<IBalanceData> = ({ data, categories }) => {

  const colors = Array.from(
    { length: categories.length },
    (_, index) => {
      return ["emerald", "indigo", "fuchsia", "amber", "lime", "violet", "pink", "yellow"][index % 8];
    },
  );

  return (
    <Card className="h-auto">
      <Title>Account Balance Over Time</Title>
      <AreaChart
        className="h-[400px]"
        showAnimation={true}
        data={data}
        index="date"
        yAxisWidth={60}
        categories={categories}
        colors={colors}
        valueFormatter={valueFormatter}
      />
    </Card>
  );
};

export default BalanceChart;
