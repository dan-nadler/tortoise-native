use crate::sim::cash::{get_account_balance_at, Frequency};
use crate::sim::portfolio::Invest;
use ndarray::Array1;
use serde::Serialize;
use std::collections::HashMap;
use ts_rs::TS;

#[allow(unused_imports)]
use self::portfolio::{Asset, Portfolio};
pub mod cash;
pub mod examples;
pub mod excel;
pub mod portfolio;

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct InvestedAccount {
    pub account: cash::Account,
    pub portfolio: Option<portfolio::Portfolio>,
}

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Transfer {
    pub from: String,
    pub to: String,
    pub frequency: Frequency,
    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
    pub amount: f64,
}

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Scenario {
    pub accounts: Vec<InvestedAccount>,
    pub transfers: Vec<Transfer>,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub num_samples: usize,
}

impl Scenario {
    pub fn from_accounts(
        accounts: Vec<cash::Account>,
        start_date: chrono::NaiveDate,
        end_date: chrono::NaiveDate,
        num_samples: usize,
    ) -> Scenario {
        let invested_accounts = accounts
            .into_iter()
            .map(|a| InvestedAccount {
                account: a,
                portfolio: Portfolio::default(),
            })
            .collect();

        Scenario {
            accounts: invested_accounts,
            start_date: start_date,
            end_date: end_date,
            transfers: vec![],
            num_samples: num_samples,
        }
    }
}

#[derive(Serialize, Clone, Debug, TS)]
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

#[derive(Serialize, Clone, Debug, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct SimulationResult {
    pub balances: Vec<AccountBalance>,
    pub uninvested_balances: Vec<AccountBalance>,
    pub payments: Vec<cash::Payment>,
}

impl SimulationResult {
    pub fn new(
        balances: Option<Vec<AccountBalance>>,
        uninvested_balances: Option<Vec<AccountBalance>>,
        payments: Option<Vec<cash::Payment>>,
    ) -> SimulationResult {
        let b = balances.unwrap_or(vec![]);
        let u = uninvested_balances.unwrap_or(vec![]);
        let p = payments.unwrap_or(vec![]);
        SimulationResult {
            balances: b,
            uninvested_balances: u,
            payments: p,
        }
    }
}

pub fn run_simulation(scenario: Scenario) -> Result<HashMap<String, SimulationResult>, String> {
    let simulation_frequency = Frequency::BusinesDay;
    let mut results = HashMap::new();
    let mut prev: HashMap<String, Array1<f64>> = HashMap::new();
    for a in &scenario.accounts {
        results.insert(
            a.account.name.clone(),
            SimulationResult::new(None, None, None),
        );
    }

    let mut d = scenario.start_date;
    while d <= scenario.end_date {
        for invested_account in scenario.accounts.iter() {
            let account = &invested_account.account;
            let portfolio = &invested_account.portfolio;
            let num_samples = &scenario.num_samples;
            let account_results = results.get_mut(&account.name).unwrap();
            
            #[allow(unused_assignments)]
            let mut bd: Array1<f64> = Array1::zeros(*num_samples);

            let p: Option<&Array1<f64>> = prev.get::<String>(&account.name);

            let uninvested_balance = get_account_balance_at(account.clone(), d, *num_samples);
            account_results
                .uninvested_balances
                .push(AccountBalance::new(
                    d,
                    account.name.clone(),
                    uninvested_balance.mean().unwrap(),
                ));

            if p.is_some() {
                bd = p.unwrap().clone();
                bd += account
                    .flows_at(d)
                    .iter()
                    .fold(0.0, |acc, x| acc + x.amount);
            } else {
                // Get account balance due to defined cash flows
                bd = uninvested_balance.clone();
            }

            // Invest the account if a portfolio is defined
            if portfolio.is_some() {
                let bd_post_investment = account.invest(
                    &bd,
                    portfolio.as_ref().unwrap(),
                    num_samples,
                    &simulation_frequency,
                );
                bd = bd_post_investment;
            }
            prev.insert(account.name.clone(), bd.clone());

            // Update the results
            account_results.balances.push(AccountBalance::new(
                d,
                account.name.clone(),
                bd.mean().unwrap(),
            ));

            // Get the cash flows for the day
            let flows = account.flows_at(d);
            for f in &flows {
                account_results.payments.push(f.clone());
            }
        }
        d = d.succ_opt().unwrap();
    }
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_run_simulation() {
        let account: cash::Account = crate::sim::examples::simple_account::simple_account();

        let scenario = Scenario {
            accounts: vec![InvestedAccount {
                account: account,
                portfolio: Some(Portfolio {
                    assets: vec![Asset {
                        name: "Equities".to_string(),
                        mean_return: 0.07,
                        std_dev: 0.15,
                    }],
                    weights: vec![1.0],
                }),
            }],
            start_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            end_date: chrono::NaiveDate::from_ymd_opt(2024, 12, 31).unwrap(),
            transfers: vec![],
            num_samples: 1,
        };

        let _r = run_simulation(scenario).unwrap();
    }

    #[test]
    fn test_run_two_account_scenario() {
        let scenario = crate::sim::examples::two_account_scenario::two_account_scenario();
        let _r = run_simulation(scenario).unwrap();
    }

    #[test]
    fn test_run_simulation_with_transfer() {
        let mut scenario = crate::sim::examples::two_account_scenario::two_account_scenario();
        scenario.accounts[0].account.name = "Account 1".into();
        scenario.accounts[1].account.name = "Account 2".into();

        let transfer = Transfer {
            from: "Account 1".to_string(),
            to: "Account 2".to_string(),
            frequency: Frequency::MonthStart,
            start_date: None,
            end_date: None,
            amount: 100.0,
        };
        scenario.transfers = vec![transfer];

        run_simulation(scenario).unwrap();

        // TODO: Check that the transfer happened
    }
}
