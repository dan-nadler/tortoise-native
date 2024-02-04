use self::{cash::get_account_balance_at, portfolio::Invest};
use crate::sim::cash::Frequency;
use ndarray;
use serde::Serialize;
use ts_rs::TS;
pub mod cash;
pub mod excel;
pub mod portfolio;
mod sample;
pub mod examples;

#[allow(dead_code)]
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

pub fn run_simulation(
    mut account: cash::Account,
    portfolio: Option<portfolio::Portfolio>,
    num_samples: usize,
) -> Result<SimulationResult, String> {
    let rebalance_frequency = Frequency::MonthStart;
    let mut results = SimulationResult::new(vec![], vec![]);

    let mut d = account.start_date;
    let num_days = account
        .end_date
        .signed_duration_since(account.start_date)
        .num_days()
        .abs() as usize;
    let mut balance_arr = account.balance + ndarray::Array2::<f64>::zeros((num_days + 2, num_samples));

    let mut i = 0;
    while d <= account.end_date {
        let mut bd = get_account_balance_at(account.clone(), d, num_samples);

        if portfolio.is_some()
            && rebalance_frequency.matches(&d, &Some(account.start_date), &Some(account.end_date))
        {
            let bd_post_investment = account.invest(
                &bd,
                &portfolio.as_ref().unwrap(),
                &num_samples,
                &rebalance_frequency,
            );
            bd = bd_post_investment;
        }

        let new_bal = &bd;
        balance_arr.slice_mut(ndarray::s![i + 1, ..]).assign(&new_bal);

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
    let _r = run_simulation(account, None, 1).unwrap();
}
