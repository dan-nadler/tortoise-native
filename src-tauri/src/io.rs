use crate::sim::cash::Account;
use std::ffi::OsStr;
use std::fs; // TODO: replace with Tauri's FS or another store
use std::path::PathBuf;

fn save_dir() -> PathBuf {
    dirs::config_dir()
        .expect("No config dir")
        .join("The Tortoise")
}

pub fn get_or_create_save_dir() -> PathBuf {
    let dir = save_dir();

    if dir.exists() {
        dir
    } else {
        std::fs::create_dir_all(&dir).expect("Could not create save dir");
        dir
    }
}

#[test]
fn test_get_save_dir() {
    let dir = get_or_create_accounts_save_dir();
    assert!(dir.is_dir());
}

// ACCOUNTS

pub fn get_or_create_accounts_save_dir() -> PathBuf {
    let dir = get_or_create_save_dir().join("accounts");

    if dir.exists() {
        dir
    } else {
        std::fs::create_dir_all(&dir).expect("Could not create save dir");
        dir
    }
}

/// Generates a timestamp-based version string.
///
/// This function uses the current local time to generate a version string in the format
/// "YYYYMMDD_HHMMSS". The version string can be used to uniquely identify a specific version
/// of an account file.
fn get_next_version() -> String {
    let now = chrono::Local::now();
    let version = now.format("%Y%m%d_%H%M%S").to_string();
    version
}

pub fn write_account_file(account: &Account) {
    // TODO: This results in a lot of config files being created. We should probably
    // cull older files so that the X most recent are kept, followed by Y daily, and
    // Z monthly, etc.
    let dir = get_or_create_accounts_save_dir();
    let fsn = &account.fs_name().clone();

    let account_folder = dir.join(fsn);
    std::fs::create_dir_all(&account_folder).expect("Could not create account folder");

    let v = get_next_version();
    let account_filename = format!("{}_{}.yaml", fsn, v);

    let account_str = serde_yaml::to_string(&account).expect("Could not serialize account");
    let account_path = account_folder.join(account_filename);

    std::fs::write(account_path, account_str).expect("Could not write account file");
}

pub fn list_accounts() -> Vec<String> {
    let dir = get_or_create_accounts_save_dir();
    let mut account_names = Vec::new();

    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                if entry.file_type().unwrap().is_dir() {
                    if let Some(account_name) = entry.file_name().to_str() {
                        let configs = entry.path().read_dir().unwrap().filter_map(|entry| {
                            if entry.unwrap().path().extension() == Some(&OsStr::new("yaml")) {
                                Some(true)
                            } else {
                                None
                            }
                        });
                        if configs.count() > 0 {
                            account_names.push(account_name.to_string());
                        }
                    }
                }
            }
        }
    }
    account_names
}

pub fn list_accounts_detail() -> Vec<Account> {
    let accounts: Vec<String> = list_accounts();
    let mut account_details = Vec::new();
    for account in accounts.iter() {
        account_details.push(read_account(&account).unwrap());
    }
    account_details
}

fn get_latest_account_version(account_name: &str) -> Option<String> {
    let dir = get_or_create_accounts_save_dir();
    let account_folder = dir.join(account_name);

    let mut versions = Vec::new();

    if let Ok(entries) = fs::read_dir(&account_folder) {
        for entry in entries {
            if let Ok(entry) = entry {
                if entry.file_type().unwrap().is_file() {
                    if let Some(account_name) = entry.file_name().to_str() {
                        if account_name.ends_with(".yaml") {
                            versions.push(account_name.to_string());
                        }
                    }
                }
            }
        }
    }

    versions.sort();
    versions.last().cloned()
}

pub fn read_account(account_name: &str) -> Result<Account, serde_yaml::Error> {
    let dir = get_or_create_accounts_save_dir();
    let account_folder = dir.join(account_name);

    let latest_version = get_latest_account_version(account_name).expect("No account found");
    let account_path = account_folder.join(latest_version);

    let account_str =
        fs::read_to_string(account_path).expect("Could not read account file to string");

    serde_yaml::from_str(&account_str)
}

pub fn delete_account(account_name: &str) -> Result<(), std::io::Error> {
    let dir = get_or_create_accounts_save_dir();
    let account_folder = dir.join(account_name);

    let deleted_folder = dir.join(".deleted").join(account_name);
    std::fs::create_dir_all(&deleted_folder).expect("Could not create deleted folder");
    // move the account files to the deleted folder

    for entry in fs::read_dir(&account_folder)?.into_iter() {
        let entry = entry?;
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_str().unwrap();
        let deleted_path = deleted_folder.join(file_name);
        fs::rename(path, deleted_path)?;
    }

    // delete main account folder
    fs::remove_dir_all(&account_folder)?;

    Ok(())
}
