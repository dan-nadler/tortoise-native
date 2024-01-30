import { Button, SearchSelect, SearchSelectItem } from "@tremor/react";
import { useEffect, useRef } from "react";

const MySelect: React.FC<{
  message: string;
  availableScenarios: string[];
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string) => void;
  isRunning: boolean;
  run?: () => void;
  runText?: string;
  children?: React.ReactNode;
}> = ({
  message,
  availableScenarios,
  selectedScenario,
  setSelectedScenario,
  isRunning,
  run: run,
  runText,
  children,
}) => {
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault(); // Prevent "/" character from being entered into the input
        const inputElement = selectRef.current?.querySelector("input");
        inputElement?.focus();
        inputElement?.select(); // Highlight the current text in the input
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex-grow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run && run();
        }}
      >
        <div className="flex flex-row flex-wrap gap-2">
          <SearchSelect
            className={`sm:w-auto md:w-[60%] flex-grow`}
            ref={selectRef}
            onValueChange={(e) => {
              setSelectedScenario(e);
            }}
            placeholder={message}
            value={selectedScenario ?? undefined}
          >
            {availableScenarios?.map((scenario, i) => (
              <SearchSelectItem key={i} value={scenario}>
                {scenario}
              </SearchSelectItem>
            ))}
          </SearchSelect>
          {run && (
            <Button
              className="flex-grow"
              type="submit"
              color={"blue"}
              disabled={isRunning}
              variant="secondary"
            >
              {runText ?? "Run"}
            </Button>
          )}
          {children}
        </div>
      </form>
    </div>
  );
};

export default MySelect;
