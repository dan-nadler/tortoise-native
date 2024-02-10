import { invoke } from "@tauri-apps/api/core";
import { SimulationResult } from "../rustTypes/SimulationResult";

export type ScenarioResult = Record<string, SimulationResult>;

export const runAccountSimulation = async (
  accountName: string,
  portfolioFilename?: string,
): Promise<ScenarioResult> => {
  return invoke<ScenarioResult>("run_account_simulation", {
    accountName,
    portfolioFilename: portfolioFilename || null,
  });
};

export const runScenarioSimulation = async (
  accountNames: string[],
): Promise<ScenarioResult> => {
  return invoke<ScenarioResult>("run_scenario_simulation", {
    accountNames,
  });
};
