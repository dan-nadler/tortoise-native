use serde_json::{json, Value};
use std::sync::Mutex;

static FILE_PATH: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
pub async fn import_account(file_path: &str, handle: tauri::AppHandle) -> Result<Value, String> {
    *FILE_PATH.lock().unwrap() = Some(file_path.to_string());

    let window = tauri::WebviewWindowBuilder::new(
        &handle,
        "import-account",
        tauri::WebviewUrl::App("import.html".into()),
    )
    .title("Import Account")
    .inner_size(1080., 720.)
    .build();

    match window {
        Ok(_w) => {}
        Err(_e) => {
            return Err("Error creating account import window".to_string());
        }
    }

    Ok(json!("{\"status\": \"ok\"}"))
}

#[tauri::command]
pub async fn get_file_path() -> Result<Value, String> {
    Ok(json!(*FILE_PATH.lock().unwrap()))
}
