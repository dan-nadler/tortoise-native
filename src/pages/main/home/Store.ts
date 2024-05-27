import { create } from "zustand";

export type AccountSelectionStore = {
  selectedAccounts: string[];
  addAccount: (account: string) => void;
  removeAccount: (account: string) => void;
};

export const useAccountSelectionStore = create<AccountSelectionStore>(
  (set) => ({
    selectedAccounts: [],
    addAccount: (account) =>
      set((state) => ({
        selectedAccounts: [...state.selectedAccounts, account],
      })),
    removeAccount: (account) =>
      set((state) => ({
        selectedAccounts: state.selectedAccounts.filter((a) => a !== account),
      })),
  }),
);
