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
use std::{ffi::OsStr, fs};

#[tauri::command]
#[allow(dead_code)]
pub async fn list_available_scenarios() -> Result<String, String> {
    let dir_path = dirs::home_dir().unwrap().join(".tortoise");
    let yaml_files = fs::read_dir(dir_path)
        .unwrap()
        .filter_map(|entry| {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_file()
                && path.extension().unwrap_or(OsStr::new("xyz")) == OsStr::new("yaml")
                && path.file_name()?.to_str()?.contains("account")
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

    Ok(serde_json::to_string(&file_names).unwrap())
}

fn load_config(account_filename: String) -> sim::cash::Account {
    let dir = dirs::home_dir()
        .expect("Could not resolve home dir")
        .join(".tortoise");
    let account_str =
        fs::read_to_string(dir.join(account_filename.clone())).expect("Could not read file");
    let mut account = sim::cash::Account::default();

    if account_filename.ends_with(".yaml") {
        account = serde_yaml::from_str(&account_str).expect("Could not parse yaml file");
    } else if account_filename.ends_with(".json") {
        account = serde_json::from_str(&account_str).expect("Could not parse json file");
    } else {
        panic!("Unknown file type: {}", account_filename);
    }

    account
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_results(account_filename: String) -> String {
    let account = load_config(account_filename);
    let response = sim::run_simulation(account, None, false);
    serde_json::to_string(&response).expect("Could not serialize account")
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_cash_flows_from_config(account_filename: String) -> String {
    let account = load_config(account_filename);
    serde_json::to_string(&account.cash_flows).expect("Could not serialize cash flows")
}
