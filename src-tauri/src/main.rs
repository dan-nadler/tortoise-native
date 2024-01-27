// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod sim;
mod io;

fn main() {
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
