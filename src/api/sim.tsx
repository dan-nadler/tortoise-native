import { invoke } from "@tauri-apps/api/core";
import { SimulationResult } from "../rustTypes/SimulationResult";

export interface ScenarioResult {
  [scenario: string]: SimulationResult;
};

export const getResults = async (
  accountName: string,
  portfolioFilename?: string,
): Promise<ScenarioResult> => {
  return invoke<ScenarioResult>("get_results", {
    accountName,
    portfolioFilename: portfolioFilename || null,
  });
};
