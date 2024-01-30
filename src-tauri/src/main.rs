// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod io;
mod sim;

fn startup_tasks() {
    let example_account = sim::examples::simple_account::simple_account();
    
    if !io::list_accounts().contains(&"example".to_string()) {
        io::write_account_file(&example_account);
    }
}

#[test]
fn test_startup_tasks() {
    startup_tasks();
    let accounts = io::list_accounts();
    assert!(accounts.contains(&"example".to_string()));
}

fn main() {
    startup_tasks();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            api::get_results,
            api::list_available_scenarios,
            api::list_available_portfolios,
            api::get_cash_flows_from_config,
            api::get_account_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
