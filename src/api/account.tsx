import { invoke } from "@tauri-apps/api/core";
import { Account } from "../rustTypes/Account";
import { CashFlow } from "../rustTypes/CashFlow";

export const listAccounts = async (): Promise<string[]> => {
  console.log(3)
  return invoke<string[]>("list_available_scenarios");
};

export const getCashFlowsFromConfig = async (
  accountName: string,
): Promise<CashFlow[]> => {
  console.log(1)
  return invoke<CashFlow[]>("get_cash_flows_from_config", {
    accountName,
  });
};

export const getAccount = async (accountName: string): Promise<Account> => {
  console.log(2)
  let a = await invoke<Account>("get_account_config", {
    accountName,
  });
  console.log(a)
  return a
};

export const saveAccount = async (account: Account): Promise<void> => {
  console.log(4)
  await invoke<void>("save_account_config", {
    account: JSON.stringify(account),
  });
};
