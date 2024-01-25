import { invoke } from "@tauri-apps/api";
import { useState, useEffect } from "react";
import Nav from "../Nav";
import { SimulationResult } from "../rustTypes/SimulationResult";
import BalanceChart from "./BalanceChart";
import CashFlowsChart from "./CashFlowsChart";
import BudgetSelect from "./Select";
import CashFlowList from "./CashFlowList";
import { CashFlow } from "../rustTypes/CashFlow";

const Main: React.FC = () => {
    const [budgetResults, setBudgetResults] = useState<SimulationResult | null>(null);
    const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
    const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    async function budget() {
        if (!selectedScenario) {
            console.error('no scenario selected');
            return;
        }

        setIsRunning(true);
        const startTime = performance.now();

        let x = await invoke<string>("get_results", { accountFilename: selectedScenario });
        let j: SimulationResult = JSON.parse(x);

        let c = await invoke<string>("get_cash_flows_from_config", { accountFilename: selectedScenario });
        let cf: CashFlow[] = JSON.parse(c);

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Minumum execution time of 250ms to make the UI a bit more smooth.
        if (executionTime < 250) {
            await new Promise((resolve) => setTimeout(resolve, 250 - executionTime));
        }

        setBudgetResults(j);
        setCashFlows(cf);
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

    return (
        <div>
            <Nav subtitle="Budget" path="/budget" />
            <div className="p-4 flex flex-col gap-4">
                <BudgetSelect
                    availableScenarios={availableScenarios}
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                    isRunning={isRunning}
                    run={budget}
                />
                <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-row gap-2 flex-grow w-full">
                        {budgetResults && <BalanceChart results={budgetResults} />}
                        {budgetResults && <CashFlowList cashFlows={cashFlows}/>}
                    </div>
                    <div className="flex flex-row gap-2 flex-grow w-full">
                        {budgetResults && <CashFlowsChart results={budgetResults} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;