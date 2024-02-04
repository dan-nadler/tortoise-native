import { invoke } from "@tauri-apps/api/core";

export const listPortfolios = async (): Promise<string[]> => {
  return invoke<string[]>("list_available_portfolios");
};
