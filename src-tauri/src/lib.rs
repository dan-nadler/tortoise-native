// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, PredefinedMenuItem, Submenu};

pub mod api;
pub mod io;
pub mod sim;

fn startup_tasks() {
    let example_account = sim::examples::simple_account::simple_account();

    if !io::list_accounts().contains(&"Example".to_string()) {
        io::write_account_file(&example_account);
    }
}

#[test]
fn test_startup_tasks() {
    startup_tasks();
    let accounts = io::list_accounts();
    assert!(accounts.contains(&"Example".to_string()));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    startup_tasks();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .menu(|handle| {
            Menu::with_items(
                handle,
                &[
                    #[cfg(target_os = "macos")]
                    &Submenu::with_items(
                        handle,
                        "The Tortoise",
                        true,
                        &[&PredefinedMenuItem::quit(handle, None)?],
                    )?,
                    &Submenu::with_items(
                        handle,
                        "File",
                        true,
                        &[
                            &PredefinedMenuItem::separator(handle)?,
                            &PredefinedMenuItem::close_window(handle, None)?,
                            #[cfg(target_os = "windows")]
                            &PredefinedMenuItem::quit(handle, None)?,
                        ],
                    )?,
                ],
            )
        })
        .invoke_handler(tauri::generate_handler![
            api::run_account_simulation,
            api::run_scenario_simulation,
            api::list_available_accounts,
            api::list_available_accounts_detail,
            api::list_available_portfolios,
            api::get_cash_flows_from_config,
            api::get_account_config,
            api::save_account_config,
            api::delete_account,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
