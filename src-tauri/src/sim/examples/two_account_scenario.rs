use super::simple_account::simple_account;
use crate::sim::{InvestedAccount, Scenario};

pub fn two_account_scenario() -> Scenario {
    let account1 = simple_account();
    let account2 = simple_account();
    Scenario {
        accounts: vec![
            InvestedAccount {
                account: account1,
                portfolio: None,
            },
            InvestedAccount {
                account: account2,
                portfolio: None,
            },
        ],
        start_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2024, 12, 31).unwrap(),
        transfers: vec![],
        num_samples: 1,
    }
}
