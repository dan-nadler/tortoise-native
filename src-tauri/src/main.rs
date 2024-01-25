// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod sim;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            api::get_results,
            api::list_available_scenarios,
            api::get_cash_flows_from_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
