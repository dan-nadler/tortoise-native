import { invoke } from "@tauri-apps/api";
import { useState, useEffect } from "react";
import Nav from "../Nav";
import { SimulationResult } from "../rustTypes";
import BudgetSelect from "../budget/Select";

const Main: React.FC = () => {
    const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);

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
            <Nav subtitle="Retirement" path="/retirement"/>
            <div className="p-4 flex flex-col gap-4">
                <BudgetSelect
                    availableScenarios={availableScenarios}
                    selectedScenario={selectedScenario}
                    setSelectedScenario={setSelectedScenario}
                    isRunning={isRunning}
                    run={() => { }}
                />
            </div>
        </div>
    );
}

export default Main;