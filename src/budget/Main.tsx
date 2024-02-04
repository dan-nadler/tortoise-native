import { useState, useEffect, useContext, memo } from "react";
import { SimulationResult } from "../rustTypes/SimulationResult";
import BalanceChart, {
  IBalanceData,
  formatResultsForBalanceChart,
} from "./BalanceChart";
import CashFlowsChart, {
  ICashFlowChartData,
  formatResultsForCashFlowChart,
} from "./CashFlowsChart";
import CashFlowList from "./CashFlowList";
import { CashFlow } from "../rustTypes/CashFlow";
import { getResults } from "../api/sim";
import { getCashFlowsFromConfig, listAccounts } from "../api/account";
import { Button } from "@tremor/react";
import { useAccountStore } from "../store/Account";
import { navContext } from "../common/NavProvider";
import { useSelectedScenarioStore } from "../common/Select";

// The cash flow chart has performance issues with the number of items that can be
// displayed. This is used to isolate the issue to the component so that the entire
// dashboard doesn't experience performance issues.
// Open support req: https://tremor-community.slack.com/archives/C055HLPMHU5/p1707061572871719
const MemoCashFlowChart = memo(CashFlowsChart);

const Main: React.FC = () => {
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
  const { name } = useAccountStore();

  async function budget(scenario: string) {
    setIsRunning(true);
    try {
      const startTime = performance.now();

      let j = await getResults(scenario);
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

  const { selectedScenario } = useSelectedScenarioStore();

  useEffect(() => {
    if (selectedScenario) budget(selectedScenario);
  }, [selectedScenario]);

  const { setAuxButtons } = useContext(navContext);
  useEffect(() => {
    setAuxButtons &&
      setAuxButtons(
        <Button
          variant={"secondary"}
          color="gray"
          loading={isRunning}
          disabled={!name}
          onClick={() => budget(name)}
        >
          {name ? "Run Budget" : "Select a Scenario"}
        </Button>,
      );
    return () => {
      setAuxButtons && setAuxButtons(null);
    };
  });

  return (
    <div>
      {/* <div className="flex flex-col gap-2 max-h-[500px]"> */}
      {budgetResults && (
        <div className="flex flex-row flex-wrap gap-2">
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
      )}
    </div>
  );
};

export default Main;
