import React from "react";
import { AreaChart, Card, Title } from "@tremor/react";
import {SimulationResult} from "../rustTypes/SimulationResult";

const BalanceChart: React.FC<{ results: SimulationResult }> = ({ results }) => {
    const data = results.balances.map((balance) => {
        return {
            date: balance.date,
            [balance.account_name]: balance.balance,
        };
    });

    const valueFormatter = function (number: number) {
        return "$ " + new Intl.NumberFormat("us").format(number).toString();
    };

    return (
        <Card>
            <Title>Account Balance Over Time</Title>
            <AreaChart
                className="h-72 mt-4"
                data={data}
                index="date"
                yAxisWidth={80}
                categories={[results.balances[0].account_name]}
                colors={["indigo"]}
                valueFormatter={valueFormatter}
            />
        </Card>
    );
}

export default BalanceChart;