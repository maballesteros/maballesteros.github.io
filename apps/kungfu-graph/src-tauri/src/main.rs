use std::{fs, path::PathBuf};

#[derive(serde::Serialize)]
struct KfgFilePayload {
    path: String,
    contents: String,
}

fn path_to_string(path: PathBuf) -> String {
    path.to_string_lossy().to_string()
}

fn default_kfg_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or_else(|| std::path::Path::new("."))
        .join("src")
        .join("data")
        .join("eagle-claw-punos-directos.kfg.yaml")
}

#[tauri::command]
fn open_default_kfg_file() -> Result<Option<KfgFilePayload>, String> {
    let path = default_kfg_path();
    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    Ok(Some(KfgFilePayload {
        path: path_to_string(path),
        contents,
    }))
}

#[tauri::command]
fn open_kfg_file() -> Result<Option<KfgFilePayload>, String> {
    let Some(path) = rfd::FileDialog::new()
        .add_filter("KungFu Graph", &["yaml", "yml"])
        .pick_file()
    else {
        return Ok(None);
    };

    let contents = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    Ok(Some(KfgFilePayload {
        path: path_to_string(path),
        contents,
    }))
}

#[tauri::command]
fn save_kfg_file(path: String, contents: String) -> Result<String, String> {
    fs::write(&path, contents).map_err(|error| error.to_string())?;
    Ok(path)
}

#[tauri::command]
fn save_kfg_file_as(contents: String, suggested_name: String) -> Result<Option<String>, String> {
    let Some(path) = rfd::FileDialog::new()
        .add_filter("KungFu Graph", &["yaml", "yml"])
        .set_file_name(&suggested_name)
        .save_file()
    else {
        return Ok(None);
    };

    fs::write(&path, contents).map_err(|error| error.to_string())?;
    Ok(Some(path_to_string(path)))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_default_kfg_file,
            open_kfg_file,
            save_kfg_file,
            save_kfg_file_as
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
