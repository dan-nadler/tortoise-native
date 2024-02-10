import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { runScenarioSimulation } from "../../api/sim";
import { Button } from "@tremor/react";
import BalanceChart, { formatResultsForBalanceChart } from "./BalanceChart";

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
        <div className="flex flex-col gap-2 md:w-full lg:w-full">
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
