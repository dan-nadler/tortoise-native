import React from "react";
import { AreaChart, Card, LineChart, Title } from "@tremor/react";
import { valueFormatter } from "../../../common/ValueFormatter";
import { SimulationResult } from "../../../rustTypes/SimulationResult";

export type BalanceData = {
  Invested: string | number;
  Uninvested: string | number;
  date: string;
};

export interface IBalanceData {
  data: BalanceData[];
  categories: string[];
}

export const formatResultsForBalanceChart = (
  results: SimulationResult,
): IBalanceData => {
  const balanceChartData: Partial<BalanceData>[] = results.balances.map(
    (balance) => {
      return {
        date: balance.date,
        Invested: balance.balance,
      };
    },
  );

  results.uninvested_balances.forEach((balance) => {
    const date = balance.date;
    const existing = balanceChartData.find((b) => b.date === date);
    if (existing) {
      existing.Uninvested = balance.balance;
    } else {
      balanceChartData.push({
        date,
        Uninvested: balance.balance,
      });
    }
  });

  return {
    data: balanceChartData as BalanceData[],
    categories: ["Invested", "Uninvested"],
  };
};

const BalanceChart: React.FC<IBalanceData> = ({ data, categories }) => {
  return (
    <Card className="h-auto">
      <Title>Account Balance Over Time</Title>
      <LineChart
        showAnimation={true}
        data={data}
        index="date"
        yAxisWidth={60}
        categories={categories}
        colors={["indigo", "blue"]}
        valueFormatter={valueFormatter}
      />
    </Card>
  );
};

export default BalanceChart;
