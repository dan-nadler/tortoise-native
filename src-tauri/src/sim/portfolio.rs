use super::cash::Account;
use super::cash::Frequency;
use ndarray::Array1;
use ndarray_rand::rand_distr::Normal;
use ndarray_rand::RandomExt;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// `Asset` represents a financial asset that can be invested in.
///
/// Mean return and standard deviation are used to calculate the return of the asset. These
/// are annual values.
///
/// # Example
///
/// ```
/// use tortoise::sim::portfolio::Asset;
///
/// let asset = Asset::new("Asset1".to_string(), 0.1, 0.05);
/// ```
#[derive(Clone, Serialize, Deserialize, JsonSchema, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
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
/// use tortoise::sim::portfolio::{Asset, Portfolio};
///
/// let assets = vec![
///     Asset::new("Asset1".to_string(), 0.1, 0.05),
///     Asset::new("Asset2".to_string(), 0.2, 0.1),
/// ];
/// let weights = vec![0.5, 0.5];
/// let portfolio = Portfolio::new(assets, weights);
/// ```
#[derive(Serialize, Deserialize, JsonSchema, Clone, TS)]
#[ts(export, export_to = "../src/rustTypes/")]
pub struct Portfolio {
    pub assets: Vec<Asset>,
    pub weights: Vec<f64>,
}

impl Portfolio {
    pub fn new(assets: Vec<Asset>, weights: Vec<f64>) -> Portfolio {
        Portfolio { assets, weights }
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

pub trait Invest {
    fn invest(
        &self,
        starting_balance: &Array1<f64>,
        portfolio: &Portfolio,
        nsamples: &usize,
        period: &Frequency,
    ) -> Array1<f64>;

    fn invest_asset(
        &self,
        asset: &Asset,
        weight: &f64,
        nsamples: &usize,
        period: &Frequency,
    ) -> Array1<f64>;
}

impl Invest for Account {
    // computes and returns the vectorized value of the account after investing in the portfolio for a single period.
    // If the mean return and std are annual, then the period is a year.
    fn invest(
        &self,
        starting_balance: &Array1<f64>,
        portfolio: &Portfolio,
        nsamples: &usize,
        period: &Frequency,
    ) -> Array1<f64> {
        let ai = portfolio.assets.iter();
        let wi = portfolio.weights.iter();
        let it = ai.zip(wi);

        let mut ret = Array1::<f64>::zeros(*nsamples);
        for (a, w) in it {
            ret = ret + self.invest_asset(a, w, nsamples, period);
        }

        starting_balance.clone() * (1.0 + ret)
    }

    fn invest_asset(
        &self,
        asset: &Asset,
        weight: &f64,
        nsamples: &usize,
        period: &Frequency,
    ) -> Array1<f64> {
        let normal = Normal::new(
            asset.mean_return * period.fraction(),
            asset.std_dev * period.fraction().sqrt(),
        )
        .unwrap(); // handle the Result here
        let a = Array1::<f64>::random(*nsamples, normal);
        *weight * &a
    }
}

#[cfg(test)]
mod invest_tests {
    use super::*;

    #[test]
    fn test_invest() {
        let account = Account::new(
            "test".to_string(),
            1000.0,
            vec![],
            chrono::NaiveDate::from_ymd_opt(2018, 1, 1).unwrap(),
            chrono::NaiveDate::from_ymd_opt(2018, 12, 31).unwrap(),
        );
        let portfolio =
            Portfolio::new(vec![Asset::new("Asset 1".to_string(), 0.1, 0.0)], vec![1.0]);
        let i = account.invest(
            &(Array1::zeros(10) + 1000.0),
            &portfolio,
            &10,
            &Frequency::Annually,
        );
        assert_eq!(i, Array1::<f64>::zeros(10) + 1100.0);
    }

    #[test]
    fn test_invest_two_assets() {
        let account = Account::new(
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
        let i = account.invest(
            &(Array1::zeros(10) + 1000.0),
            &portfolio,
            &10,
            &Frequency::Annually,
        );
        assert_eq!(i, Array1::<f64>::zeros(10) + 1150.0);
    }
}
