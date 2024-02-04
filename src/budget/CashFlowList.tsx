import React from "react";
import { Card, Title, Text, DeltaBar, Flex } from "@tremor/react";
import { CashFlow } from "../rustTypes/CashFlow";

const valueFormatter = (number: number) =>
  `${Math.sign(number) < 0 ? "-" : ""}\$${Intl.NumberFormat("us").format(Math.abs(number)).toString()}`;

const CashFlowList: React.FC<{ cashFlows: CashFlow[] }> = ({ cashFlows }) => {
  const maxAmount = Math.max(
    ...cashFlows.map((cashFlow: CashFlow) => cashFlow.amount),
  );

  return (
    <Card>
      <Flex flexDirection="row" alignItems="baseline">
        <Title>Cash Flows</Title>
        <Text>Log Scaled</Text>
      </Flex>
      <div
        className="flex flex-col gap-2 py-2"
        style={{
          overflowY: "auto",
        }}
      >
        {cashFlows
          .sort(
            (a: CashFlow, b: CashFlow) =>
              Math.abs(b.amount) - Math.abs(a.amount),
          )
          .map((cashFlow: CashFlow) => {
            return (
              <div className="flex flex-col text-xs text-gray-400">
                <div className="flex w-full flex-row justify-between gap-4 pb-1">
                  <div>{cashFlow.name}</div>
                  <div>{valueFormatter(cashFlow.amount)}</div>
                </div>
                <DeltaBar
                  className="cursor-pointer hover:opacity-75"
                  value={
                    (Math.log(Math.abs(cashFlow.amount)) /
                      Math.log(maxAmount)) *
                    Math.sign(cashFlow.amount) *
                    100
                  }
                  tooltip={`${valueFormatter(cashFlow.amount)} | ${cashFlow.frequency}`}
                  onClick={() => {}}
                />
              </div>
            );
          })}
      </div>
    </Card>
  );
};

export default CashFlowList;
