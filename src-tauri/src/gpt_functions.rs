use crate::sim::cash::Account;
use std::collections::HashMap;

struct Simulation {
    accounts: HashMap<i32, Account>,
}

impl Simulation {
    pub fn new() -> Simulation {
        Simulation {
            accounts: HashMap::new(),
        }
    }

    pub fn add_account(&mut self, account: Account) -> i32 {
        let id = self.current_max_id().unwrap_or(0) + 1;
        self.accounts.insert(id, account);
        id
    }

    fn current_max_id(&self) -> Option<i32> {
        self.accounts.keys().max().cloned()
    }

    pub fn run(&mut self) {
        // TODO: implement
    }
}

static SIMULATION: Simulation = Simulation::new();

pub fn create_account(
    name: String,
    initial_balance: f64,
    start_date: chrono::NaiveDate,
    end_date: chrono::NaiveDate,
) -> String {
    let a = Account {
        name,
        initial_balance,
        vec![],
        start_date,
        end_date,
    };

    "{\"id\": {}}".format(SIMULATION.add_account(a))
}

pub fn add_cash_flow(
    account: &mut Account,
    amount: f64,
    date: chrono::NaiveDate,
    description: String,
) {
    account.cash_flows.push(CashFlow {
        amount,
        date,
        description,
    });
}