use crate::sim::cash::Account;
use std::ffi::OsStr;
use std::fs;
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

fn get_next_version() -> String {
    let now = chrono::Local::now();
    let version = now.format("%Y%m%d_%H%M%S").to_string();
    version
}

pub fn write_account_file(account: &Account) {
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

#[test]
fn read_example_config() {
    let account = read_account("example");
    assert_eq!(account.unwrap().name, "Example");
}