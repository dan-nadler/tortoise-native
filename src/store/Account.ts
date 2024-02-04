import { create } from 'zustand';
import { Account } from '../rustTypes/Account';
import { CashFlow } from '../rustTypes/CashFlow';
import { Frequency } from '../rustTypes/Frequency';

type State = Account & {
    setName: (name: string) => void;
    setStartDate: (start_date: string) => void;
    setEndDate: (end_date: string) => void;
    setBalance: (balance: number) => void;
    setAll: (account: Account) => void;
    setAccount: (account: Account) => void;
    reset: () => void;
    
    addCashFlow: (cashFlow: CashFlow) => void;
    removeCashFlow: (cashFlow: CashFlow) => void;
    addCashFlowIndex: (index: number) => void;
    removeCashFlowIndex: (index: number) => void;
    setCashFlowName: (index: number, name: string) => void;
    setCashFlowAmount: (index: number, amount: number) => void;
    setCashFlowFrequency: (index: number, frequency: Frequency) => void;
    setCashFlowStartDate: (index: number, start_date: string) => void;
    setCashFlowEndDate: (index: number, end_date: string) => void;
    setCashFlowTaxRate: (index: number, tax_rate: number) => void;

    addCashFlowTag: (index: number, tag: string) => void;
    removeCashFlowTag: (index: number, tag: string) => void;
    clearCashFlowTags: (index: number) => void;
    setCashFlowTags: (index: number, tags: string[]) => void;
};

export const useAccountStore = create<State>((set) => ({
    name: '',
    balance: 0,
    cash_flows: [],
    start_date: '',
    end_date: '',
    setName: (name) => set((state) => ({ ...state, name })),
    setStartDate: (start_date) => set((state) => ({ ...state, start_date })),
    setEndDate: (end_date) => set((state) => ({ ...state, end_date })),
    setBalance: (balance) => set((state) => ({ ...state, balance })),
    setAll: (account) => set(account),
    setAccount: (account) => set((_) => ({...account})),
    reset: () => set({ name: '', balance: 0, cash_flows: [], start_date: '', end_date: '' }),
    addCashFlow: (cashFlow) => set((state) => ({ ...state, cash_flows: [...state.cash_flows, cashFlow] })),
    removeCashFlow: (cashFlow) => set((state) => ({ ...state, cash_flows: state.cash_flows.filter(cf => cf !== cashFlow) })),
    addCashFlowIndex: (index) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows.splice(index, 0, { name: null, amount: 0, frequency: "Annually", start_date: null, end_date: null, tax_rate: 0, tags: null});
        return { ...state, cash_flows };
    }),
    removeCashFlowIndex: (index) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows.splice(index, 1);
        return { ...state, cash_flows };
    }),
    setCashFlowName: (index, name) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].name = name;
        return { ...state, cash_flows };
    }),
    setCashFlowAmount: (index, amount) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].amount = amount;
        return { ...state, cash_flows };
    }),
    setCashFlowFrequency: (index, frequency) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].frequency = frequency;
        return { ...state, cash_flows };
    }),
    setCashFlowStartDate: (index, start_date) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].start_date = start_date;
        return { ...state, cash_flows };
    }),
    setCashFlowEndDate: (index, end_date) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].end_date = end_date;
        return { ...state, cash_flows };
    }),
    setCashFlowTaxRate: (index, tax_rate) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].tax_rate = tax_rate ?? 0;
        return { ...state, cash_flows };
    }),
    addCashFlowTag: (index, tag) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].tags = [...cash_flows[index].tags ?? [], tag];
        return { ...state, cash_flows };
    }),
    removeCashFlowTag: (index, tag) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].tags = cash_flows[index].tags?.filter(t => t !== tag) || [];
        return { ...state, cash_flows };
    }),
    clearCashFlowTags: (index) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].tags = [];
        return { ...state, cash_flows };
    }),
    setCashFlowTags: (index, tags) => set((state) => {
        const cash_flows = [...state.cash_flows];
        cash_flows[index].tags = tags;
        return { ...state, cash_flows };
    }),
}));
