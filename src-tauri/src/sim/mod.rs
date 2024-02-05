use self::{cash::get_account_balance_at, portfolio::Invest};
use crate::sim::cash::Frequency;
use ndarray;
use serde::Serialize;
use ts_rs::TS;
pub mod cash;
pub mod examples;
pub mod excel;
pub mod portfolio;
mod sample;

#[derive(Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct InvestedAccount {
    pub account: cash::Account,
    pub portfolio: Option<portfolio::Portfolio>,
    pub num_samples: usize,
}

#[derive(Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Transfer {
    pub from: String,
    pub to: String,
    pub frequency: Frequency,
    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
    pub amount: f64,
}

#[derive(Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Scenario {
    pub accounts: Vec<InvestedAccount>,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub transfers: Vec<Transfer>,
}

#[derive(Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
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

#[derive(Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct SimulationResult {
    pub balances: Vec<AccountBalance>,
    pub payments: Vec<cash::Payment>,
}

impl SimulationResult {
    pub fn new(balances: Vec<AccountBalance>, payments: Vec<cash::Payment>) -> SimulationResult {
        SimulationResult { balances, payments }
    }
}

pub fn run_simulation(mut scenario: Scenario) -> Result<SimulationResult, String> {
    let simulation_frequency = Frequency::BusinesDay;
    let mut results = SimulationResult::new(vec![], vec![]);

    let invested_account = scenario.accounts.pop().expect("No accounts in scenario.");
    let account = invested_account.account;
    let portfolio = invested_account.portfolio;
    let num_samples = invested_account.num_samples;

    let mut d = account.start_date;
    let num_days = account
        .end_date
        .signed_duration_since(account.start_date)
        .num_days()
        .abs() as usize;
    let mut balance_arr =
        account.balance + ndarray::Array2::<f64>::zeros((num_days + 2, num_samples));

    let mut i = 0;
    while d <= account.end_date {
        // Get account balance due to defined cash flows
        let mut bd = get_account_balance_at(account.clone(), d, num_samples);

        //
        if portfolio.is_some() {
            let bd_post_investment = account.invest(
                &bd,
                &portfolio.as_ref().unwrap(),
                &num_samples,
                &simulation_frequency,
            );
            bd = bd_post_investment;
        }

        let new_bal = &bd;
        balance_arr
            .slice_mut(ndarray::s![i + 1, ..])
            .assign(&new_bal);

        results.balances.push(AccountBalance::new(
            d,
            account.name.clone(),
            balance_arr.slice_mut(ndarray::s![i, ..]).mean().unwrap(),
        ));

        let flows = account.flows_at(d);
        for f in &flows {
            results.payments.push(f.clone());
        }

        d = d.succ_opt().unwrap();
        i += 1;
    }

    Ok(results)
}

#[test]
fn test_run_simulation() {
    let dir = dirs::home_dir()
        .unwrap()
        .join(".tortoise")
        .join("default_account.yaml");
    let config = std::fs::read_to_string(dir.to_str().unwrap()).unwrap();
    let account: cash::Account = serde_yaml::from_str(&config).unwrap();

    let scenario = Scenario {
        accounts: vec![InvestedAccount {
            account: account,
            portfolio: None,
            num_samples: 1,
        }],
        start_date: chrono::NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
        transfers: vec![],
    };

    let _r = run_simulation(scenario).unwrap();
}


#[test]
fn test_run_simulation_with_transfer() {
    let account1 = cash::Account {
        name: "Account 1".to_string(),
        balance: 1000.0,
        cash_flows: vec![],
        start_date: chrono::NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
    };
    let account2 = cash::Account {
        name: "Account 2".to_string(),
        balance: 0.0,
        cash_flows: vec![],
        start_date: chrono::NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
    };
    let transfer = Transfer {
        from: "Account 1".to_string(),
        to: "Account 2".to_string(),
        frequency: Frequency::MonthStart,
        start_date: None,
        end_date: None,
        amount: 100.0,
    };
    let scenario = Scenario {
        accounts: vec![
            InvestedAccount {
                account: account1,
                portfolio: None,
                num_samples: 1,
            },
            InvestedAccount {
                account: account2,
                portfolio: None,
                num_samples: 1,
            },
        ],
        transfers: vec![transfer],
        start_date: chrono::NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2020, 2, 1).unwrap(),
    };
    let r = run_simulation(scenario).unwrap();
    
    // TODO: Check that the transfer happened
}