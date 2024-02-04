import React from "react";
import { AreaChart, Card, Title } from "@tremor/react";
import {SimulationResult} from "../rustTypes/SimulationResult";
import { valueFormatter } from "../common/ValueFormatter";

const BalanceChart: React.FC<{ results: SimulationResult }> = ({ results }) => {
    const data = results.balances.map((balance) => {
        return {
            date: balance.date,
            [balance.account_name]: balance.balance,
        };
    });

    return (
        <Card>
            <Title>Account Balance Over Time</Title>
            <AreaChart
                data={data}
                index="date"
                yAxisWidth={60}
                categories={[results.balances[0].account_name]}
                colors={["indigo"]}
                valueFormatter={valueFormatter}
            />
        </Card>
    );
}

export default BalanceChart;