import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import Nav from "./Nav";
import BalanceChart from "./budget/BalanceChart";
import CashFlowsChart from "./budget/CashFlowsChart";
import { SimulationResult } from "./rustTypes";


const App: React.FC = () => {
  const [budgetResults, setBudgetResults] = useState<SimulationResult | null>(null);
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  async function budget() {
    if (!selectedScenario) {
      console.error('no scenario selected');
      return;
    }

    // setIsRunning(true);
    const startTime = performance.now();
    let x = await invoke<string>("get_results", { accountFilename: selectedScenario });
    let j: SimulationResult = JSON.parse(x);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Minumum execution time of 250ms to make the UI a bit more smooth.
    if (executionTime < 250) {
      await new Promise((resolve) => setTimeout(resolve, 250 - executionTime));
    }

    setBudgetResults(j);
    setIsRunning(false);
  }

  async function listAvailableScenarios() {
    let x = await invoke<string>("list_available_scenarios");
    let j: string[] = JSON.parse(x);
    setAvailableScenarios(j);
  }

  useEffect(() => {
    listAvailableScenarios();
  }, []);

  const Form = () => {
    return (
      <div className="bg-white rounded shadow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            budget();
          }}
        >
          <div className="flex">
            <select
              id="scenario-input"
              onChange={(e) => {
                console.log(e.currentTarget.value);
                setSelectedScenario(e.currentTarget.value);
              }}
              value={selectedScenario ?? undefined}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a scenario</option>
              {availableScenarios?.map((scenario, i) => (
                <option key={i} value={scenario}>
                  {scenario}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className={`ml-2 px-4 ${isRunning ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded`}
              style={{ minWidth: "150px" }}
              disabled={isRunning}
            >
              Run
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <Nav />
      <div className="p-4 flex flex-col gap-4">
        <Form />
        <div className="flex flex-col gap-2">
          <div>
            {budgetResults && <BalanceChart results={budgetResults} />}
          </div>
          <div>
            {budgetResults && <CashFlowsChart results={budgetResults} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
