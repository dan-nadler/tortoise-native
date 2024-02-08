import { useState, useEffect } from "react";
import Select from "../../common/Select";
import { Button } from "@tremor/react";
import { listAccounts } from "../../api/account";
import { listPortfolios } from "../../api/portfolio";

const Main: React.FC = () => {
    const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
    const [availablePortfolios, setAvailablePortfolios] = useState<string[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
    const [isRunning, _] = useState<boolean>(false);

    async function getData() {
        const [scenarios, portfolios] = await Promise.all([
            listAccounts(),
            listPortfolios()
        ]);

        setAvailableScenarios(scenarios);
        setAvailablePortfolios(portfolios);
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-row gap-2 flex-grow min-w-[300px]">
                    <Select
                        message="Select a scenario"
                        availableScenarios={availableScenarios}
                        selectedScenario={selectedScenario}
                        setSelectedScenario={setSelectedScenario}
                        isRunning={isRunning}
                    />
                    <Select
                        message="Select a portfolio"
                        availableScenarios={availablePortfolios}
                        selectedScenario={selectedPortfolio}
                        setSelectedScenario={setSelectedPortfolio}
                        isRunning={isRunning}
                    />
                </div>
                <Button className="min-w-[25%]">
                    Run
                </Button>
            </div>
        </div>
    );
}

export default Main;