// #[get("/")]
// async fn index() -> impl Responder {
//     HttpResponse::Ok().body("Hello, world!")
// }

// #[derive(Debug, serde::Deserialize, serde::Serialize)]
// struct ScenarioQuery {
//     scenario: String,
// }

// #[derive(Debug, Serialize)]
// struct ScenarioResponse {
//     scenario: String,
//     // Add more fields as needed
// }

use crate::sim;
use crate::io;
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
#[allow(dead_code)]
pub async fn list_available_scenarios() -> Result<String, String> {
    let file_names = get_file_names("account");
    Ok(serde_json::to_string(&file_names).expect("Could not serialize file names"))
}

// list available portfolios
#[tauri::command]
#[allow(dead_code)]
pub async fn list_available_portfolios() -> Result<String, String> {
    let file_names = get_file_names("portfolio");
    Ok(serde_json::to_string(&file_names).expect("Could not serialize file names"))
}

fn load_config<T>(account_filename: String) -> Result<T, serde_yaml::Error>
where
    T: serde::de::DeserializeOwned,
    T: Clone,
{
    let dir = io::get_or_create_save_dir();
    let account_str =
        fs::read_to_string(dir.join(account_filename.clone())).expect("Could not read file");
    println!("account_str: {}", account_str);
    if account_filename.ends_with(".yaml") {
        return serde_yaml::from_str(&account_str);
    } else {
        panic!("Unknown file type: {}", account_filename);
    }
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_results(
    account_filename: String,
    portfolio_filename: Option<String>,
) -> Result<String, String> {
    let account = load_config::<sim::cash::Account>(account_filename);
    let portfolio = match portfolio_filename {
        Some(p) => Some(load_config::<sim::portfolio::Portfolio>(p).expect("Could not load portfolio")),
        None => None,
    };

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let response = sim::run_simulation(
        account.unwrap(),
        portfolio,
        false,
        3,
    );

    if !response.is_ok() {
        return Err("{\"error\": \"Error running simulation\"}".to_string());
    }

    let r = serde_json::to_string(&response.unwrap()).unwrap();
    Ok(r.to_string())
}

#[tokio::test]
async fn test_get_results() {
    let r = get_results("default_account.yaml".to_string(), None).await;
    assert!(r.is_ok());
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_cash_flows_from_config(account_filename: String) -> Result<String, String> {
    let account = load_config::<sim::cash::Account>(account_filename);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let cf = serde_json::to_string(&account.unwrap().cash_flows).unwrap();
    Ok(cf.to_string())
}


#[tauri::command]
#[allow(dead_code)]
pub async fn get_account_config(account_filename: String) -> Result<String, String> {
    let account = load_config::<sim::cash::Account>(account_filename);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let cf = serde_json::to_string(&account.unwrap()).unwrap();
    println!("{:?}", cf);
    Ok(cf.to_string())
}