use serde_json::{json, Value};

#[tauri::command]
pub async fn import_account(file_path: &str, handle: tauri::AppHandle) -> Result<Value, String> {
    println!("Importing account from {}", file_path);

    let window = tauri::WebviewWindowBuilder::new(
        &handle,
        "import-account",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Import Account")
    .inner_size(1080., 720.)
    .build();

    match window {
        Ok(w) => {}
        Err(e) => {
            return Err("Error creating account import window".to_string());
        }
    }

    Ok(json!("{\"status\": \"ok\"}"))
}
