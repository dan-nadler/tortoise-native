import { useState, useEffect } from "react";
import { SimulationResult } from "../rustTypes/SimulationResult";
import BalanceChart from "./BalanceChart";
import CashFlowsChart from "./CashFlowsChart";
import BudgetSelect from "../common/Select";
import CashFlowList from "./CashFlowList";
import { CashFlow } from "../rustTypes/CashFlow";
import { getResults } from "../api/sim";
import { getCashFlowsFromConfig, listAccounts } from "../api/account";

const Main: React.FC = () => {
  const [budgetResults, setBudgetResults] = useState<SimulationResult | null>(
    null,
  );
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  async function budget() {
    if (!selectedScenario) {
      console.error("no scenario selected");
      return;
    }

    setIsRunning(true);
    try {
      const startTime = performance.now();

      let j = await getResults(selectedScenario);

      let cf = await getCashFlowsFromConfig(selectedScenario);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Minumum execution time of 250ms to make the UI a bit more smooth.
      if (executionTime < 250) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250 - executionTime),
        );
      }

      setBudgetResults(j);
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

  return (
    <div>
      <div className="flex flex-col gap-4">
        <BudgetSelect
          message="Select a scenario"
          availableScenarios={availableScenarios}
          selectedScenario={selectedScenario}
          setSelectedScenario={setSelectedScenario}
          isRunning={isRunning}
          run={budget}
        />
        {budgetResults && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-grow flex-row gap-2">
              <BalanceChart results={budgetResults} />
              <CashFlowList cashFlows={cashFlows} />
            </div>
            <div className="flex w-full flex-grow flex-row gap-2">
              <CashFlowsChart results={budgetResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
