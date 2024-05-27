import React from "react";
import { Card, Title, Text, DeltaBar, Flex, CardProps } from "@tremor/react";
import { CashFlow } from "../../../../rustTypes/CashFlow";
import { valueFormatter } from "../../../../common/ValueFormatter";

interface CashFlowListProps extends CardProps {
  cashFlows: CashFlow[];
}

const CashFlowList: React.FC<CashFlowListProps> = ({ cashFlows, ...props }) => {
  const maxAmount = Math.max(
    ...cashFlows.map((cashFlow: CashFlow) => cashFlow.amount),
  );

  return (
    <Card {...props}>
      <Flex flexDirection="row" alignItems="baseline">
        <Title>Cash Flows</Title>
        <Text>Log Scaled</Text>
      </Flex>
      <div className="flex h-[724px] flex-col gap-2 overflow-y-scroll">
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
