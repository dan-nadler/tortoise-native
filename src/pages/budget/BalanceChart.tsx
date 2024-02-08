import React from "react";
import { AreaChart, Card, Title } from "@tremor/react";
import { valueFormatter } from "../../common/ValueFormatter";
import { SimulationResult } from "../../rustTypes/SimulationResult";

export type BalanceData = {
  [x: string]: string | number;
  date: string;
};

export interface IBalanceData {
  data: BalanceData[];
  categories: string[];
}

export const formatResultsForBalanceChart = (
  results: SimulationResult,
): IBalanceData => {
  const balanceChartData = results.balances.map((balance) => {
    return {
      date: balance.date,
      [balance.account_name]: balance.balance,
    };
  });

  return {  
    data: balanceChartData,
    categories: [results.balances[0].account_name]
  };
};

const BalanceChart: React.FC<IBalanceData> = ({ data, categories }) => {
  return (
    <Card className="h-auto">
      <Title>Account Balance Over Time</Title>
      <AreaChart
        showAnimation={true}
        data={data}
        index="date"
        yAxisWidth={60}
        categories={categories}
        colors={["indigo"]}
        valueFormatter={valueFormatter}
      />
    </Card>
  );
};

export default BalanceChart;
