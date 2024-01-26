const Select: React.FC<{
  message: string;
  availableScenarios: string[];
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string) => void;
  isRunning: boolean;
  run?: () => void;
}> = ({
  message,
  availableScenarios,
  selectedScenario,
  setSelectedScenario,
  isRunning,
  run: run
}) => {
    return (
      <div className="bg-white rounded shadow flex-grow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run && run();
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
              <option value="">{message}</option>
              {availableScenarios?.map((scenario, i) => (
                <option key={i} value={scenario}>
                  {scenario}
                </option>
              ))}
            </select>
            {run &&
              <button
                type="submit"
                className={`ml-2 px-4 ${isRunning ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded`}
                style={{ minWidth: "100px" }}
                disabled={isRunning}
              >
                Run
              </button>
            }
          </div>
        </form>
      </div>
    );
  };

export default Select;
