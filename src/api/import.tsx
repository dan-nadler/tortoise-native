import { invoke } from "@tauri-apps/api/core";

export const importAccount = async (filePath: string): Promise<string[]> => {
  return invoke<string[]>("import_account", { filePath });
};


export const getFilePath = async (): Promise<string> => {
  return invoke<string>("get_file_path");
}