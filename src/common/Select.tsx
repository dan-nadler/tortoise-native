import {
  Button,
  ButtonProps,
  SearchSelect,
  SearchSelectItem,
  SearchSelectProps,
} from "@tremor/react";
import { useEffect, useRef, useState } from "react";
import { useAccountStore } from "../store/Account";
import { getAccount, listAccounts } from "../api/account";
import { create } from "zustand";

interface ISelectedScenarioStore {
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string) => void;
}

export const useSelectedScenarioStore = create<ISelectedScenarioStore>(
  (set) => ({
    selectedScenario: "",
    setSelectedScenario: (scenario: string) =>
      set({ selectedScenario: scenario }),
  }),
);

interface MySelectProps extends Omit<SearchSelectProps, "children"> {
  message: string;
  availableScenarios: string[];
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string) => void;
  isRunning: boolean;
  run?: () => void;
  runText?: string;
  className?: string;
  children?: React.ReactNode;
  buttonProps?: ButtonProps;
}

const MySelect: React.FC<MySelectProps> = ({
  message,
  availableScenarios,
  selectedScenario,
  setSelectedScenario,
  isRunning,
  run: run,
  runText,
  children,
  className,
  buttonProps,
  ...props
}) => {
  const selectRef = useRef<HTMLInputElement>(null);

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
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        run && run();
      }}
    >
      <SearchSelect
        {...props}
        className={`w-auto flex-grow`}
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
          loading={isRunning}
          {...buttonProps}
        >
          {runText ?? "Run"}
        </Button>
      )}
      {children}
    </form>
  );
};

export const AccountSelect: React.FC<Partial<MySelectProps>> = ({
  className,
  children,
}) => {
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
  const { setSelectedScenario, selectedScenario } = useSelectedScenarioStore();
  const [isRunning, _] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const state = useAccountStore();

  useEffect(() => {
    listAccounts().then(setAvailableScenarios);
  }, [state]);

  useEffect(() => {
    // TODO: this is not a safe way to determine if the scenario is loaded
    // The name of the scenario is not guaranteed to be the name of the account, but
    // this is generally the case now by convention.
    if (state.name == selectedScenario) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }

    if (!selectedScenario && state.name) {
      setSelectedScenario(state.name);
    }
  }, [state.name, selectedScenario]);

  function loadScenario(s: string) {
    setSelectedScenario(s);
    state.reset();
    getAccount(s).then((a) => {
      state.setAll(a);
    });
  }

  return (
    <div className="flex w-full flex-row justify-center gap-2">
      <MySelect
        enableClear={false}
        className={className}
        message="Select a scenario"
        availableScenarios={availableScenarios}
        selectedScenario={selectedScenario}
        setSelectedScenario={loadScenario}
        isRunning={isRunning}
        runText={loaded ? "Loaded" : "Load"}
        buttonProps={{
          disabled: loaded,
          color: loaded ? "green" : "blue",
        }}
      />
      {children}
    </div>
  );
};

export default MySelect;
