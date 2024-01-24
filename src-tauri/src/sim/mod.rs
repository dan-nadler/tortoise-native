use serde::Serialize;

use self::portfolio::Invest;
use crate::sim::cash::Frequency;
pub mod cash;
pub mod excel;
pub mod portfolio;
mod sample;

#[allow(dead_code)]
#[derive(Serialize, Clone)]
pub struct AccountBalance {
    pub date: chrono::NaiveDate,
    pub account_name: String,
    pub balance: f64,
}

impl AccountBalance {
    fn new(date: chrono::NaiveDate, account_name: String, balance: f64) -> AccountBalance {
        AccountBalance {
            date,
            account_name,
            balance,
        }
    }
}

#[derive(Serialize, Clone)]
pub struct SimulationResult {
    pub balances: Vec<AccountBalance>,
    pub payments: Vec<cash::Payment>,
}

impl SimulationResult {
    pub fn new(balances: Vec<AccountBalance>, payments: Vec<cash::Payment>) -> SimulationResult {
        SimulationResult { balances, payments }
    }
}

pub fn run_simulation(
    mut account: cash::Account,
    portfolio: Option<portfolio::Portfolio>,
    print_results: bool,
) -> SimulationResult {
    let rebalance_frequency = Frequency::MonthStart;

    // read config from file account.yaml
    if print_results {
        println!("--- Beginning Simulation ---");
        println!("Loaded Account: {}\n", account.name);
    }

    let mut results = SimulationResult::new(vec![], vec![]);

    let mut d = account.start_date;

    while d < account.end_date {
        let b = account.balance_at(d);

        // TODO: This attributes the full future month's investment income to the first day of the month. This is not correct.
        if rebalance_frequency.matches(&d, &Some(account.start_date), &Some(account.end_date))
            && portfolio.is_some()
        {
            let i = account.invest(portfolio.as_ref().unwrap()) * rebalance_frequency.fraction();
            if print_results {
                println!("Investment income of {}, on {}", i, d);
            }
        }

        if print_results {
            println!("{}, {} balance, {}", d, account.name, b);
        }
        results
            .balances
            .push(AccountBalance::new(d, account.name.clone(), b));

        d = d.succ_opt().unwrap();
    }

    let mut d = account.start_date;
    while d < account.end_date {
        let flows = account.flows_at(d);
        for f in &flows {
            if print_results {
                println!("{}, {}, {}", d, f.cash_flow.name.clone().unwrap(), f.amount);
            }
            results.payments.push(f.clone());
        }
        d = d.succ_opt().unwrap();
    }

    if print_results {
        println!("--- End of Simulation ---");
    }
    results
}

#[test]
fn test() {
    let config = std::fs::read_to_string("./scenarios/examples/default_account.yaml").unwrap();
    let account: cash::Account = serde_yaml::from_str(&config).unwrap();
    run_simulation(account, None, false);
}
