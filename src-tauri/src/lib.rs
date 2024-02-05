// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

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

    // let quit_menu = tauri::menu::PredefinedMenuItem::quit(
    //     handle,
    //     "Quit".into(),
    // );

    // let m = |handle: &_| {
    //     let menu = tauri::menu::Menu::with_items(
    //         handle,
    //         &[
    //             &tauri::menu::Submenu::with_items(
    //                 handle,
    //                 "File",
    //                 true,
    //                 &[],
    //             )?,
    //             &tauri::menu::Submenu::with_items(
    //                 handle,
    //                 "Scenario",
    //                 true,
    //                 &[
    //                     // TODO: Implement menu items
    //                     // &tauri::menu::MenuItem::new(handle, "Edit", true, "CmdOrCtrl+E".into()),
    //                     // &tauri::menu::MenuItem::new(handle, "Save", true, "CmdOrCtrl+S".into()),
    //                     // &tauri::menu::MenuItem::new(handle, "New", true, "CmdOrCtrl+N".into()),
    //                     // &tauri::menu::MenuItem::new(handle, "Close", true, "CmdOrCtrl+W".into()),
    //                 ],
    //             )?,
    //         ],
    //     );
    //     return menu;
    // };

    let t = tauri::Builder::default()
        .menu(|handle| {
            Menu::with_items(
                handle,
                &[
                    #[cfg(target_os = "macos")]
                    &Submenu::with_items(
                        handle,
                        "The Tortoise",
                        true,
                        &[
                            &PredefinedMenuItem::quit(handle, None)?,
                        ],
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
        // .menu(m)
        // .setup(|app| {
        //     let handle = app.handle();
        //     TODO: Implement menu handlers
        //     handle.on_menu_event(|x, y| {
        //         println!("{:?}\n{:?}", x, y);
        //     });
        //     Ok(())
        // })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            api::get_results,
            api::list_available_scenarios,
            api::list_available_portfolios,
            api::get_cash_flows_from_config,
            api::get_account_config,
            api::save_account_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
