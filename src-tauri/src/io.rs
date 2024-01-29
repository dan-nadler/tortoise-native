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
    let dir = get_or_create_save_dir();
    assert!(dir.is_dir());
}
