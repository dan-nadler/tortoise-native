import { useState, useEffect, memo } from "react";
import { SimulationResult } from "../../../../rustTypes/SimulationResult";
import BalanceChart, {
  IBalanceData,
  formatResultsForBalanceChart,
} from "./BalanceChart";
import CashFlowsChart, {
  ICashFlowChartData,
  formatResultsForCashFlowChart,
} from "./CashFlowsChart";
import CashFlowList from "./CashFlowList";
import { CashFlow } from "../../../../rustTypes/CashFlow";
import { runAccountSimulation } from "../../../../api/sim";
import { getCashFlowsFromConfig, listAccounts } from "../../../../api/account";
import { Button } from "@tremor/react";
import { useParams } from "react-router-dom";

// The cash flow chart has performance issues with the number of items that can be
// displayed. This is used to isolate the issue to the component so that the entire
// dashboard doesn't experience performance issues.
// Open support req: https://tremor-community.slack.com/archives/C055HLPMHU5/p1707061572871719
const MemoCashFlowChart = memo(CashFlowsChart);

const Main: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  const [budgetResults, setBudgetResults] = useState<SimulationResult | null>(
    null,
  );

  const [balanceChartData, setBalanceChartData] = useState<IBalanceData | null>(
    null,
  );

  const [cashFlowsChartData, setCashFlowsChartData] =
    useState<ICashFlowChartData | null>(null);

  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [_, setAvailableScenarios] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  async function budget(scenario: string) {
    setIsRunning(true);
    try {
      const startTime = performance.now();

      let r = await runAccountSimulation(scenario);
      let j = r[scenario];
      let cf = await getCashFlowsFromConfig(scenario);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Minumum execution time of 250ms to make the UI a bit more smooth.
      if (executionTime < 250) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250 - executionTime),
        );
      }

      setBudgetResults(j);

      // format data for balance chart
      const balanceChartData = formatResultsForBalanceChart(j);
      setBalanceChartData(balanceChartData);

      // format data for cash flow chart
      const cashFlowsChartData = formatResultsForCashFlowChart(j);
      setCashFlowsChartData(cashFlowsChartData);

      setCashFlows(cf);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    listAccounts().then(setAvailableScenarios);
  }, []);

  useEffect(() => {
    if (name) budget(name);
  }, [name]);

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
        className={`flex flex-row flex-wrap gap-2 ${budgetResults && !isRunning ? "" : "hidden"}`}
      >
        <div className="flex flex-col gap-2 md:w-full lg:w-[75%]">
          {balanceChartData && (
            <BalanceChart
              data={balanceChartData.data}
              categories={balanceChartData.categories}
            />
          )}
          {cashFlowsChartData && (
            <MemoCashFlowChart
              data={cashFlowsChartData.data}
              categories={cashFlowsChartData.categories}
              colors={cashFlowsChartData.colors}
            />
          )}
        </div>
        <div className="flex-grow">
          <CashFlowList cashFlows={cashFlows} className="" />
        </div>
      </div>
    </div>
  );
};

export default Main;
