import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { runScenarioSimulation } from "../../api/sim";
import { Button } from "@tremor/react";
import BalanceChart, { formatResultsForBalanceChart } from "./BalanceChart";

const TEST_DATA = [
  { date: "2024-01-01", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-02", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-03", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-04", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-05", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-06", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-07", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-08", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-09", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-10", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-11", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-12", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-13", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-14", Example: 3000, "Test Account": 1000 },
  { date: "2024-01-15", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-16", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-17", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-18", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-19", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-20", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-21", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-22", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-23", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-24", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-25", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-26", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-27", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-28", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-29", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-30", Example: 7000, "Test Account": 1850 },
  { date: "2024-01-31", Example: 11000, "Test Account": 2700 },
  { date: "2024-02-01", Example: 4000, "Test Account": 2700 },
];

const Main: React.FC = () => {
  const [searchParams, _] = useSearchParams();
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const accounts = searchParams.get("accounts");
  const [results, setResults] = useState<any>(null);
  const [balanceChartData, setBalanceChartData] = useState<any>(null);

  useEffect(() => {
    if (accounts) {
      setIsRunning(true);
      runScenarioSimulation(accounts.split(","))
        .then((j) => {
          setResults(j);

          const balanceChartData = formatResultsForBalanceChart(j);
          setBalanceChartData(balanceChartData);
        })
        .finally(() => {
          setIsRunning(false);
        });
    }
  }, [accounts]);

  return (
    <div>
      <div
        className={`flex w-full flex-row justify-center ${!isRunning ? "hidden" : ""}`}
      >
        <Button
          size="xl"
          loading={isRunning}
          loadingText="Simulation Running"
          variant="secondary"
        >
          Simulation Running
        </Button>
      </div>
      <div
        className={`flex flex-row flex-wrap gap-2 ${results && !isRunning ? "" : "hidden"}`}
      >
        <div className="flex flex-col gap-2 md:w-full lg:w-[75%]">
          {balanceChartData && (
            <BalanceChart data={balanceChartData.data} categories={balanceChartData.categories} />
          )}
        </div>
        <div className="flex-grow"></div>
      </div>
    </div>
  );
};

export default Main;
