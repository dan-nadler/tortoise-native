import { useState, useEffect, useContext } from "react";
import { SimulationResult } from "../rustTypes/SimulationResult";
import BalanceChart from "./BalanceChart";
import CashFlowsChart from "./CashFlowsChart";
import CashFlowList from "./CashFlowList";
import { CashFlow } from "../rustTypes/CashFlow";
import { getResults } from "../api/sim";
import { getCashFlowsFromConfig, listAccounts } from "../api/account";
import { Button } from "@tremor/react";
import { useStore } from "../store/Account";
import { navContext } from "../common/NavProvider";

const Main: React.FC = () => {
  const [budgetResults, setBudgetResults] = useState<SimulationResult | null>(
    null,
  );
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [_, setAvailableScenarios] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { name } = useStore();

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
    }
  });

  return (
    <div>
      <div className="flex flex-col gap-2">
        {/* <div className="m-auto p-10">
          
        </div> */}
        {budgetResults && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-stretch gap-2">
              <div className="flex w-[75%] flex-col gap-2">
                <BalanceChart results={budgetResults} />
                <CashFlowsChart results={budgetResults} />
              </div>
              <div className="flex-grow">
                <CashFlowList cashFlows={cashFlows} className="" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
