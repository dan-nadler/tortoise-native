import { invoke } from "@tauri-apps/api/core";

export const importAccount = async (filePath: string): Promise<string[]> => {
  return invoke<string[]>("import_account", { filePath });
};
