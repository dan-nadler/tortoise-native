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

fn load_config(account_filename: String) -> Result<sim::cash::Account, serde_yaml::Error> {
    let dir = dirs::home_dir()
        .expect("Could not resolve home dir")
        .join(".tortoise");
    let account_str =
        fs::read_to_string(dir.join(account_filename.clone())).expect("Could not read file");

    if account_filename.ends_with(".yaml") {
        return serde_yaml::from_str(&account_str);
    } else {
        panic!("Unknown file type: {}", account_filename);
    }
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_results(account_filename: String) -> Result<String, String> {
    let account = load_config(account_filename);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let response = sim::run_simulation(account.unwrap(), None, false);

    if !response.is_ok() {
        return Err("{\"error\": \"Error running simulation\"}".to_string());
    }

    let r = serde_json::to_string(&response.unwrap()).unwrap();
    println!("{:?}", r);
    Ok(r.to_string())
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_cash_flows_from_config(account_filename: String) -> Result<String, String> {
    let account = load_config(account_filename);

    if !account.is_ok() {
        return Err("{\"error\": \"Error loading account\"}".to_string());
    }

    let cf = serde_json::to_string(&account.unwrap().cash_flows).unwrap();
    Ok(cf.to_string())
}
