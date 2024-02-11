use serde_json::json;
use serde_json::Value;

use crate::io;
use crate::sim;
use std::{ffi::OsStr, fs};

fn get_file_names(contains: &str) -> Vec<String> {
    let dir_path = io::get_or_create_save_dir();
    let yaml_files = fs::read_dir(dir_path)
        .unwrap()
        .filter_map(|entry| {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_file()
                && path.extension()? == OsStr::new("yaml")
                && path.file_name()?.to_str()?.contains(contains)
            {
                Some(path)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    let file_names = yaml_files
        .iter()
        .map(|path| path.file_name().unwrap().to_str().unwrap().to_string())
        .collect::<Vec<_>>();

    file_names
}

#[tauri::command]
pub async fn list_available_accounts() -> Result<Value, String> {
    let account_names = io::list_accounts();
    Ok(json!(&account_names))
}

#[tauri::command]
pub async fn list_available_accounts_detail() -> Result<Value, String> {
    let account_details = io::list_accounts_detail();
    Ok(json!(&account_details))
}

#[tauri::command]
pub async fn list_available_portfolios() -> Result<Value, String> {
    let file_names = get_file_names("portfolio");
    Ok(json!(&file_names))
}

fn load_config<T>(account_filename: String) -> Result<T, serde_yaml::Error>
where
    T: serde::de::DeserializeOwned,
    T: Clone,
{
    let dir = io::get_or_create_save_dir();
    let account_str =
        fs::read_to_string(dir.join(account_filename.clone())).expect("Could not read file");
    if account_filename.ends_with(".yaml") {
        return serde_yaml::from_str(&account_str);
    } else {
        panic!("Unknown file type: {}", account_filename);
    }
}

#[tauri::command]
pub async fn run_account_simulation(
    account_name: String,
    portfolio_filename: Option<String>,
) -> Result<Value, String> {
    let account = io::read_account(&account_name);
    let portfolio = match portfolio_filename {
        Some(p) => {
            Some(load_config::<sim::portfolio::Portfolio>(p).expect("Could not load portfolio"))
        }
        None => None,
    };

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let acc = account.unwrap();

    let scenario = sim::Scenario {
        accounts: vec![sim::InvestedAccount {
            account: acc.clone(),
            portfolio,
        }],
        start_date: acc.start_date.clone(),
        end_date: acc.end_date.clone(),
        transfers: vec![],
        num_samples: 1,
    };

    let response = sim::run_simulation(scenario);

    if !response.is_ok() {
        return Err("{\"error\": \"Error running simulation\"}".to_string());
    }

    // let r = serde_json::to_string(&response.unwrap()).unwrap();
    Ok(json!(&response.unwrap()))
}

#[tokio::test]
async fn test_get_results_fails_cleanly() {
    let _r = run_account_simulation("Not A Real Scenario 1234".to_string(), None).await;
}

#[tauri::command]
pub async fn get_cash_flows_from_config(account_name: String) -> Result<Value, String> {
    let account = io::read_account(&account_name);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    Ok(json!(&account.unwrap().cash_flows))
}

#[tauri::command]
pub async fn get_account_config(account_name: String) -> Result<Value, String> {
    let account = io::read_account(&account_name);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    Ok(json!(&account.unwrap()))
}

#[tauri::command]
pub async fn save_account_config(account: String) -> Result<(), String> {
    let account: sim::cash::Account = serde_json::from_str(&account).unwrap();
    io::write_account_file(&account);
    Ok(())
}

#[tauri::command]
pub async fn delete_account(account_name: String) -> Result<(), String> {
    let r = io::delete_account(&account_name);
    if r.is_err() {
        return Err("{\"error\": \"Error deleting account\"}".to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn run_scenario_simulation(account_names: Vec<String>) -> Result<Value, String> {
    let mut accounts: Vec<sim::cash::Account> = Vec::new();
    let mut start_date: Option<chrono::NaiveDate> = None;
    let mut end_date: Option<chrono::NaiveDate> = None;

    for account_name in account_names {
        let account = io::read_account(&account_name);
        let account_start_date = account.as_ref().unwrap().start_date;
        let account_end_date = account.as_ref().unwrap().end_date;

        if account.is_ok() {
            accounts.push(account.unwrap());
            if start_date.is_none() || account_start_date < start_date.unwrap() {
                start_date = Some(account_start_date);
            }
            if end_date.is_none() || account_end_date > end_date.unwrap() {
                end_date = Some(account_end_date);
            }
        }
    }

    if (end_date.is_none() || start_date.is_none()) && accounts.len() > 0 {
        return Err(
            "{\"error\": \"Unable to infer simulation date range from accounts.\"}".to_string(),
        );
    }

    let scenario =
        sim::Scenario::from_accounts(accounts, start_date.unwrap(), end_date.unwrap(), 1);
        
    let response = sim::run_simulation(scenario);
    

    if !response.is_ok() {
        return Err("{\"error\": \"Error running simulation\"}".to_string());
    }

    // let r = serde_json::to_string(&response.unwrap()).unwrap();
    Ok(json!(&response.unwrap()))
}
