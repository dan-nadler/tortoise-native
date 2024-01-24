use super::cash::Account;
use polars::df;
use polars::prelude::*;
use rand_distr::Distribution;
use rand_distr::Normal;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// `Asset` represents a financial asset that can be invested in.
///
/// Mean return and standard deviation are used to calculate the return of the asset. These
/// are annual values.
///
/// # Example
///
/// ```
/// use budget::sim::portfolio::Asset;
///
/// let asset = Asset::new("Asset1".to_string(), 0.1, 0.05);
/// ```
#[derive(Clone, Serialize, Deserialize, JsonSchema)]
pub struct Asset {
    pub name: String,
    pub mean_return: f64,
    pub std_dev: f64,
}

impl Asset {
    pub fn new(name: String, mean_return: f64, std_dev: f64) -> Asset {
        Asset {
            name,
            mean_return,
            std_dev,
        }
    }
}

/// `Portfolio` represents a collection of `Asset`s and their respective weights in the portfolio.
///
/// Each `Asset` in the `assets` vector corresponds to a weight in the `weights` vector.
/// The weight represents the proportion of the portfolio's value that is invested in the asset.
///
/// # Example
///
/// ```
/// use budget::sim::portfolio::{Asset, Portfolio};
///
/// let assets = vec![
///     Asset::new("Asset1".to_string(), 0.1, 0.05),
///     Asset::new("Asset2".to_string(), 0.2, 0.1),
/// ];
/// let weights = vec![0.5, 0.5];
/// let portfolio = Portfolio::new(assets, weights);
/// ```
#[derive(Serialize, Deserialize, JsonSchema, Clone)]
pub struct Portfolio {
    pub assets: Vec<Asset>,
    pub weights: Vec<f64>,
}

impl Portfolio {
    pub fn new(assets: Vec<Asset>, weights: Vec<f64>) -> Portfolio {
        Portfolio { assets, weights }
    }

    fn returns_sample(&self) -> f64 {
        let ai = self.assets.iter();
        let wi = self.weights.iter();
        let it = ai.zip(wi);

        let mut ret: f64 = 0.0;
        for (a, w) in it {
            let normal = Normal::new(a.mean_return, a.std_dev).unwrap();
            let v = normal.sample(&mut rand::thread_rng());
            ret += v * w;
        }

        ret
    }

    fn returns_vec(&self, dates: &[chrono::NaiveDate], name: &str) -> Series {
        let mut returns: Vec<f64> = vec![];
        for _ in dates.iter() {
            returns.push(self.clone().returns_sample());
        }

        Series::new(name, returns)
    }

    pub fn returns_frame(&self, dates: &Vec<chrono::NaiveDate>, num_samples: i64) -> DataFrame {
        let mut df = df![
            "dates" => dates,
        ]
        .expect("Dataframe creation failed.");

        for n in 0..num_samples {
            let r = self.returns_vec(dates, &format!("Sample {}", n));
            let e = format!("Dataframe creation failed on sample number {}.", n);
            df = df.hstack(&[r]).unwrap_or_else(|_| { panic!("{}", e) });
        }

        df
    }
}

#[allow(unused)]
fn date_sequence(start: chrono::NaiveDate, end: chrono::NaiveDate) -> Vec<chrono::NaiveDate> {
    let mut dates = Vec::new();
    let mut current_date = start;
    while current_date <= end {
        dates.push(current_date);
        current_date += chrono::Duration::days(1);
    }
    dates
}

#[cfg(test)]
mod portfolio_tests {
    #[test]
    fn test_returns_frame() {
        use super::*;

        let assets = vec![
            Asset::new("Asset1".to_string(), 0.1, 0.05),
            Asset::new("Asset2".to_string(), 0.2, 0.1),
        ];
        let weights = vec![0.5, 0.5];
        let portfolio = Portfolio::new(assets, weights);

        let start_date = chrono::NaiveDate::from_ymd_opt(2018, 1, 1).unwrap();
        let end_date = chrono::NaiveDate::from_ymd_opt(2018, 12, 31).unwrap();
        let dates: Vec<chrono::prelude::NaiveDate> = date_sequence(start_date, end_date);

        let df = portfolio.returns_frame(&dates, 1);
        assert_eq!(df.width(), 2);
        assert_eq!(df.height(), 365);
        println!("{:?}", df);
    }

    #[test]
    fn test_returns_frame_3_samples() {
        use super::*;

        let assets = vec![Asset::new("Asset1".to_string(), 0.1, 0.05)];
        let weights = vec![1.0];
        let portfolio = Portfolio::new(assets, weights);

        let start_date = chrono::NaiveDate::from_ymd_opt(2018, 1, 1).unwrap();
        let end_date = chrono::NaiveDate::from_ymd_opt(2018, 12, 31).unwrap();
        let dates: Vec<chrono::prelude::NaiveDate> = date_sequence(start_date, end_date);

        let df = portfolio.returns_frame(&dates, 3);

        assert_eq!(df.width(), 4);
        assert_eq!(df.height(), 365);

        // assert std devs are almost 0.05
        let s1: f64 = df["Sample 0"]
            .std_as_series(1)
            .unwrap()
            .f64()
            .unwrap()
            .get(0)
            .unwrap();
        let s2: f64 = df["Sample 1"]
            .std_as_series(1)
            .unwrap()
            .f64()
            .unwrap()
            .get(0)
            .unwrap();
        let s3: f64 = df["Sample 2"]
            .std_as_series(1)
            .unwrap()
            .f64()
            .unwrap()
            .get(0)
            .unwrap();

        assert!((s1 - 0.05).abs() < 0.01);
        assert!((s2 - 0.05).abs() < 0.01);
        assert!((s3 - 0.05).abs() < 0.01);

        // assert means are almost 0.1
        let m1: f64 = df["Sample 0"].mean().unwrap();
        let m2: f64 = df["Sample 1"].mean().unwrap();
        let m3: f64 = df["Sample 2"].mean().unwrap();

        assert!((m1 - 0.1).abs() < 0.01);
        assert!((m2 - 0.1).abs() < 0.01);
        assert!((m3 - 0.1).abs() < 0.01);
    }
}

pub trait Invest {
    fn invest(&mut self, portfolio: &Portfolio) -> f64;

    fn invest_asset(&mut self, asset: &Asset, weight: &f64) -> f64;
}

impl Invest for Account {
    fn invest(&mut self, portfolio: &Portfolio) -> f64 {
        let ai = portfolio.assets.iter();
        let wi = portfolio.weights.iter();
        let it = ai.zip(wi);

        let mut income: f64 = 0.0;
        for (a, w) in it {
            income += self.invest_asset(a, w);
        }

        self.balance += income;

        income
    }

    fn invest_asset(&mut self, asset: &Asset, weight: &f64) -> f64 {
        (weight * self.balance) * (asset.mean_return + (asset.std_dev * rand::random::<f64>()))
    }
}

#[cfg(test)]
mod invest_tests {
    use super::*;

    #[test]
    fn test_invest() {
        let mut account = Account::new(
            "test".to_string(),
            1000.0,
            vec![],
            chrono::NaiveDate::from_ymd_opt(2018, 1, 1).unwrap(),
            chrono::NaiveDate::from_ymd_opt(2018, 12, 31).unwrap(),
        );
        let portfolio =
            Portfolio::new(vec![Asset::new("Asset 1".to_string(), 0.1, 0.0)], vec![1.0]);
        account.invest(&portfolio);
        assert_eq!(account.balance, 1100.0);
    }

    #[test]
    fn test_invest_two_assets() {
        let mut account = Account::new(
            "test".to_string(),
            1000.0,
            vec![],
            chrono::NaiveDate::from_ymd_opt(2018, 1, 1).unwrap(),
            chrono::NaiveDate::from_ymd_opt(2018, 12, 31).unwrap(),
        );
        let portfolio = Portfolio::new(
            vec![
                Asset::new("Asset 1".to_string(), 0.1, 0.0),
                Asset::new("Asset 2".to_string(), 0.2, 0.0),
            ],
            vec![0.5, 0.5],
        );
        account.invest(&portfolio);
        assert_eq!(account.balance, 1150.0);
    }
}
