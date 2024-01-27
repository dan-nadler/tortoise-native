import { Button, Select, SelectItem } from "@tremor/react";

const MySelect: React.FC<{
  message: string;
  availableScenarios: string[];
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string) => void;
  isRunning: boolean;
  run?: () => void;
  runText?: string;
}> = ({
  message,
  availableScenarios,
  selectedScenario,
  setSelectedScenario,
  isRunning,
  run: run,
  runText
}) => {
    return (
      <div className="flex-grow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run && run();
          }}
        >
          <div className="flex gap-2">
            <Select
              onValueChange={(e) => {
                setSelectedScenario(e);
              }}
              placeholder={message}
              value={selectedScenario ?? undefined}
            >
              {availableScenarios?.map((scenario, i) => (
                <SelectItem key={i} value={scenario}>
                  {scenario}
                </SelectItem>
              ))}
            </Select>
            {run &&
              <Button
                type="submit"
                color={'blue'}
                style={{ minWidth: "100px" }}
                disabled={isRunning}
              >
                {runText ?? 'Run'}
              </Button>
            }
          </div>
        </form>
      </div>
    );
  };

export default MySelect;
