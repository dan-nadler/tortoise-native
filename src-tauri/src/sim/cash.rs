use chrono::{Datelike, NaiveDate};
use memoize::memoize;
use ndarray::Array1;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[allow(unused_imports)]
use std::hash::{Hash, Hasher};

// a list contianing the number of days in each month
pub const DAYS_IN_MONTH: [u32; 12] = [
    31, // January
    28, // February
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31, // December
];

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, JsonSchema, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub enum Frequency {
    Once,
    MonthStart,
    MonthEnd,
    SemiMonthly,
    Annually,
}

impl Frequency {
    pub fn fraction(&self) -> f64 {
        match self {
            Frequency::Once => 1.0,
            Frequency::MonthStart => 1.0 / 12.0,
            Frequency::MonthEnd => 1.0 / 12.0,
            Frequency::SemiMonthly => 1.0 / 24.0,
            Frequency::Annually => 1.0,
        }
    }

    pub fn matches(
        &self,
        d: &chrono::NaiveDate,
        start_date: &Option<chrono::NaiveDate>,
        end_date: &Option<chrono::NaiveDate>,
    ) -> bool {
        if let Some(start_date) = start_date {
            if start_date > d {
                return false;
            }
        }
        if let Some(end_date) = end_date {
            if end_date < d {
                return false;
            }
        }

        match self {
            Frequency::Once => {
                if let Some(start_date) = start_date {
                    if start_date != d {
                        return false;
                    }
                }
            }
            Frequency::MonthStart => {
                if d.day() != 1 {
                    return false;
                }
            }
            Frequency::MonthEnd => {
                let last_day_of_month = DAYS_IN_MONTH[(d.month() as usize) - 1];
                if d.day() != last_day_of_month {
                    return false;
                }
            }
            Frequency::SemiMonthly => {
                let last_day_of_month = DAYS_IN_MONTH[(d.month() as usize) - 1];
                if d.day() != last_day_of_month && d.day() != 15 {
                    return false;
                }
            }
            Frequency::Annually => {
                let sd = start_date.unwrap();
                if d.month() != sd.month() || d.day() != sd.day() {
                    return false;
                }
            }
        }

        true
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, JsonSchema, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Payment {
    pub cash_flow: CashFlow,
    pub date: NaiveDate,
    pub amount: f64,
}

impl Payment {
    pub fn new(date: NaiveDate, amount: f64, cash_flow: CashFlow) -> Payment {
        Payment {
            date,
            amount,
            cash_flow,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, JsonSchema, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct CashFlow {
    pub name: Option<String>,
    pub amount: f64,
    pub frequency: Frequency,
    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
    pub tax_rate: f64,
    pub tags: Option<Vec<String>>,
}

impl CashFlow {
    // cache the cash flow payments

    // frequency is optional with default value of "once"
    pub fn new(
        name: Option<String>,
        amount: f64,
        frequency: Option<Frequency>,
        start_date: Option<chrono::NaiveDate>,
        end_date: Option<chrono::NaiveDate>,
        tax_rate: Option<f64>,
        tags: Option<Vec<String>>,
    ) -> CashFlow {
        CashFlow {
            name,
            amount,
            frequency: frequency.unwrap_or(Frequency::Once),
            start_date,
            end_date,
            tax_rate: tax_rate.unwrap_or(0.0),
            tags,
        }
    }

    pub fn set_name(&mut self, name: String) {
        self.name = Some(name);
    }

    pub fn payments(
        &mut self,
        start_date: chrono::NaiveDate,
        end_date: chrono::NaiveDate,
        tax_payments: bool,
    ) -> Vec<Payment> {
        // returns a vec of payments
        let mut d = start_date.pred_opt().unwrap();
        let mut payments: Vec<Payment> = vec![];

        // If tax payments have been requests, but the tax rate is 0, return an empty vec
        if tax_payments && self.tax_rate == 0.0 {
            return payments;
        }

        while d < end_date {
            d = d.succ_opt().unwrap();

            if self.frequency.matches(&d, &self.start_date, &self.end_date) {
                let mut p = Payment::new(
                    d,
                    if tax_payments {
                        self.amount * -self.tax_rate
                    } else {
                        self.amount
                    },
                    self.clone(),
                );

                if tax_payments {
                    p.cash_flow
                        .set_name(format!("{} Tax", self.name.clone().unwrap()));
                }

                payments.push(p.clone());
            }
        }
        payments
    }
}

#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Account {
    pub name: String,
    pub balance: f64,
    pub cash_flows: Vec<CashFlow>,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
}

impl Account {
    pub fn new(
        name: String,
        balance: f64,
        cash_flows: Vec<CashFlow>,
        start_date: chrono::NaiveDate,
        end_date: chrono::NaiveDate,
    ) -> Account {
        Account {
            name,
            balance,
            cash_flows,
            start_date,
            end_date,
        }
    }

    pub fn default() -> Account {
        Account {
            name: "Account".to_string(),
            balance: 0.0,
            cash_flows: vec![],
            start_date: chrono::NaiveDate::from_ymd_opt(2000, 1, 1).unwrap(),
            end_date: chrono::NaiveDate::from_ymd_opt(2999, 12, 31).unwrap(),
        }
    }

    pub fn add_cash_flow(&mut self, cash_flow: CashFlow) {
        self.cash_flows.push(cash_flow);
    }

    pub fn payments(
        &mut self,
        start_date: chrono::NaiveDate,
        end_date: chrono::NaiveDate,
    ) -> Vec<Payment> {
        let mut payments: Vec<Payment> = vec![];
        for cash_flow in &mut self.cash_flows {
            payments.append(&mut cash_flow.payments(start_date, end_date, false));
            payments.append(&mut cash_flow.payments(start_date, end_date, true));
        }
        // sort by date
        payments.sort_by(|a, b| a.date.cmp(&b.date));
        payments
    }

    pub fn balance_at(&mut self, date: chrono::NaiveDate) -> f64 {
        let mut balance = self.balance;
        for cash_flow in &mut self.cash_flows {
            let payments = cash_flow.payments(self.start_date, date, false);
            let taxes = cash_flow.payments(self.start_date, date, true);
            for payment in payments.into_iter().chain(taxes) {
                balance += payment.amount;
            }
        }
        balance
    }

    pub fn flows_at(&mut self, date: chrono::NaiveDate) -> Vec<Payment> {
        // Returns a vec of Payment objects corresponding to all flows on this date
        let mut flows: Vec<Payment> = vec![];
        for cash_flow in &mut self.cash_flows {
            let payments = &mut cash_flow.payments(date, date, false);
            let taxes = &mut cash_flow.payments(date, date, true);
            for payment in payments.iter_mut().chain(taxes) {
                flows.push(payment.clone());
            }
        }
        flows.sort_by(|a, b| a.date.cmp(&b.date));
        flows
    }
}

impl std::cmp::PartialEq for Account {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}

impl std::cmp::Eq for Account {}

impl std::hash::Hash for Account {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.name.hash(state);
    }
}

#[test]
fn test_account_hash() {
    // test that the account hash is based on the name
    let account1 = Account::new(
        "Test Account".to_string(),
        0.0,
        vec![CashFlow::new(
            Some("Test Cash Flow".to_string()),
            100.0,
            Some(Frequency::MonthStart),
            None,
            None,
            None,
            None,
        )],
        NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
    );

    let account2 = Account::new(
        "Test Account 2".to_string(),
        0.0,
        vec![CashFlow::new(
            Some("Test Cash Flow".to_string()),
            100.0,
            Some(Frequency::MonthStart),
            None,
            None,
            None,
            None,
        )],
        NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
    );

    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    account1.hash(&mut hasher);
    let hash1 = hasher.finish();

    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    account2.hash(&mut hasher);
    let hash2 = hasher.finish();

    assert_ne!(hash1, hash2);
}

#[memoize(Capacity: 8192)]
pub fn get_account_balance_at(
    account: Account,
    date: chrono::NaiveDate,
    num_samples: usize,
) -> Array1<f64> {
    let mut a = account.clone();
    let f = a.flows_at(date);
    #[allow(unused_assignments)]
    let mut b: Array1<f64> = Array1::<f64>::zeros(num_samples);
    if date > a.start_date {
        b = get_account_balance_at(a, date - chrono::Duration::days(1), num_samples);
    } else {
        b = Array1::<f64>::zeros(num_samples) + a.balance; // starting balance
    }
    b + f.iter().fold(0.0, |acc, x| acc + x.amount)
}

#[test]
fn test_get_account_balance_at() {
    let account = Account::new(
        "Test Account".to_string(),
        0.0,
        vec![CashFlow::new(
            Some("Test Cash Flow".to_string()),
            100.0,
            Some(Frequency::MonthStart),
            None,
            None,
            None,
            None,
        )],
        NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        NaiveDate::from_ymd_opt(2020, 12, 31).unwrap(),
    );
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 1, 1).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 100.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 1, 2).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 100.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 1, 31).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 100.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 2, 1).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 200.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 2, 2).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 200.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 2, 29).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 200.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 3, 1).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 300.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 3, 2).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 300.0);
    let balance = get_account_balance_at(
        account.clone(),
        NaiveDate::from_ymd_opt(2020, 3, 31).unwrap(),
        1,
    );
    assert_eq!(balance, Array1::<f64>::zeros(1) + 300.0);
}
