export interface AccountBalance {
    date: string;
    account_name: string;
    balance: number;
  }
  
export interface CashFlow {
  name: string;
  amount: number;
  frequency: string;
  start_date: string;
  end_date: string;
  tax_rate: number;
}

export interface Payment {
  cash_flow: CashFlow;
  date: string;
  amount: number;
}

export interface SimulationResult {
  balances: AccountBalance[];
  payments: Payment[];
}