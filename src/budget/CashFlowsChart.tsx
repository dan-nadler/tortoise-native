import React from "react";
import { BarChart, Card, Title } from "@tremor/react";
import { SimulationResult } from "../rustTypes/SimulationResult";
import { Payment } from "../rustTypes/Payment";
import { valueFormatter } from "../common/ValueFormatter";

export const formatResultsForCashFlowChart = (results: SimulationResult) => {
  const cashFlowNames: string[] = results.payments.map(
    (payment: Payment) => payment.cash_flow.name || "Unnammed Cash Flow",
  );
  const uniqueCashFlowNames = [...new Set(cashFlowNames)];

  const chartData = new Map<string, any>();
  console.log("process cash flow results");
  results.payments.forEach((payment: Payment) => {
    if (payment.date && payment.cash_flow.name && payment.amount) {
      const date = payment.date;
      const cashFlowName = payment.cash_flow.name;
      const amount = payment.amount;

      if (!chartData.has(date)) {
        chartData.set(date, {});
      }

      chartData.get(date)[cashFlowName] = amount;
    }
  });

  const chartDataArray = Array.from(chartData.entries()).map(
    ([date, cashFlows]) => {
      // Combine all but the top 5 cash flows into the "Other" category
      // const topCashFlows = Object.entries(cashFlows as { [x: string]: number })
      //   .sort((a, b) => b[1] - a[1])
      //   .slice(0, 5)

      // const otherCashFlows = Object.entries(
      //   cashFlows as { [x: string]: number },
      // )
      //   .sort((a, b) => b[1] - a[1])
      //   .slice(5)
      //   .reduce((acc, [name, value]) => acc + value, 0);

      return {
        date,
        ...cashFlows,
      };
    },
  );

  const colors = Array.from(
    { length: uniqueCashFlowNames.length },
    (_, index) => {
      return ["blue", "teal", "amber", "rose", "indigo", "emerald"][index % 6];
    },
  );
  console.log(uniqueCashFlowNames.length);
  console.log(chartDataArray.length);
  return {
    data: chartDataArray,
    categories: uniqueCashFlowNames,
    colors,
  };
};

export interface ICashFlowChartData {
  data: any[];
  categories: string[];
  colors: string[];
}

const Chart: React.FC<ICashFlowChartData> = ({ data, categories, colors }) => {
  return (
    <Card>
      <Title>Cash Flows</Title>
      <BarChart
        data={data}
        index="date"
        categories={categories}
        colors={colors}
        valueFormatter={valueFormatter}
        yAxisWidth={60}
        onValueChange={() => {}}
        stack={true}
        layout="horizontal"
        enableLegendSlider={true}
        showTooltip={true}
        showLegend={true}
      />
    </Card>
  );
};

export default Chart;
