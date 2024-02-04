import { invoke } from "@tauri-apps/api/core";
import { SimulationResult } from "../rustTypes/SimulationResult";

export const getResults = async (
  accountName: string,
  portfolioFilename?: string,
): Promise<SimulationResult> => {
  return invoke<SimulationResult>("get_results", {
    accountName,
    portfolioFilename: portfolioFilename || null,
  });
};
