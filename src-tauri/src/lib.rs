use engine as eng;

#[tauri::command]
fn best_comps(lobby_json: String) -> Result<Vec<eng::ScoredComp>, String> {
  eng::best_comps(lobby_json)
}

#[tauri::command]
fn update_meta() -> Result<(), String> {
  eng::update_meta()
}

#[tauri::command]
fn detect_units(path: String) -> Result<Vec<eng::UnitDetection>, String> {
  eng::detect_units(path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![best_comps, update_meta, detect_units])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
