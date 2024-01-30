import { invoke } from "@tauri-apps/api";
import { useState, useEffect } from "react";
import { SimulationResult } from "../rustTypes/SimulationResult";
import BalanceChart from "./BalanceChart";
import CashFlowsChart from "./CashFlowsChart";
import BudgetSelect from "../common/Select";
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
        try {
            const startTime = performance.now();

            let x = await invoke<string>("get_results", { accountName: selectedScenario, portfolioFilename: null });
            let j: SimulationResult = JSON.parse(x);
            console.log(j)

            let c = await invoke<string>("get_cash_flows_from_config", { accountName: selectedScenario, portfolioFilename: null });
            let cf: CashFlow[] = JSON.parse(c);
            console.log(cf)

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            // Minumum execution time of 250ms to make the UI a bit more smooth.
            if (executionTime < 250) {
                await new Promise((resolve) => setTimeout(resolve, 250 - executionTime));
            }

            setBudgetResults(j);
            setCashFlows(cf);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunning(false);
        }
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
            <div className="flex flex-col gap-4">
                <BudgetSelect
                    message="Select a scenario"
                    availableScenarios={availableScenarios}
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                    isRunning={isRunning}
                    run={budget}
                />
                {budgetResults &&
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex flex-row gap-2 flex-grow w-full">
                            <BalanceChart results={budgetResults} />
                            <CashFlowList cashFlows={cashFlows} />
                        </div>
                        <div className="flex flex-row gap-2 flex-grow w-full">
                            <CashFlowsChart results={budgetResults} />
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default Main;