import { invoke } from "@tauri-apps/api/core";
import { Account } from "../rustTypes/Account";
import { CashFlow } from "../rustTypes/CashFlow";

export const listAccounts = async (): Promise<string[]> => {
  return invoke<string[]>("list_available_accounts");
};

export const listAccountsDetail = async (): Promise<Account[]> => {
  return invoke<Account[]>("list_available_accounts_detail");
}

export const getCashFlowsFromConfig = async (
  accountName: string,
): Promise<CashFlow[]> => {
  return invoke<CashFlow[]>("get_cash_flows_from_config", {
    accountName,
  });
};

export const getAccount = async (accountName: string): Promise<Account> => {
  let a = await invoke<Account>("get_account_config", {
    accountName,
  });
  return a
};

export const saveAccount = async (account: Account): Promise<void> => {
  await invoke<void>("save_account_config", {
    account: JSON.stringify(account),
  });
};
