use crate::sim::cash::{Account, CashFlow, Frequency};

pub fn simple_account() -> Account {
    Account::new(
        "Example".into(),
        10_000.0,
        vec![
            CashFlow::new(
                Some("Income".to_string()),
                5000.0,
                Some(Frequency::SemiMonthly),
                None,
                None,
                Some(0.2),
                Some(vec!["Income".to_string()]),
            ),
            CashFlow::new(
                Some("Mortgage".to_string()),
                -4000.0,
                Some(Frequency::MonthStart),
                None,
                None,
                Some(0.0),
                Some(vec!["Expenses".to_string()]),
            ),
            CashFlow::new(
                Some("Other Expenses".to_string()),
                -1000.0,
                Some(Frequency::MonthStart),
                None,
                None,
                Some(0.0),
                Some(vec!["Expenses".to_string()]),
            ),
            CashFlow::new(
                Some("Vacation".to_string()),
                -10_000.0,
                Some(Frequency::Once),
                chrono::NaiveDate::from_ymd_opt(2024, 11, 05),
                None,
                Some(0.0),
                Some(vec!["Investment".to_string()]),
            ),
        ],
        chrono::NaiveDate::from_ymd_opt(2024, 01, 01).unwrap(),
        chrono::NaiveDate::from_ymd_opt(2024, 12, 31).unwrap(),
    )
}
