use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use serde_json;
use std::collections::HashSet;
use std::process::Command;
use std::str;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Composition {
    pub name: String,
    pub champions: Vec<String>,
    pub base_power: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lobby {
    pub my_units: Vec<String>,
    pub enemy_units: Vec<Vec<String>>, // each vector represents one opponent's board
}

/// Calculate a score for a given composition in a specific lobby.
///
/// Formula:
///   score = base_power + 0.6 * personal_affinity - 0.4 * overlap
///
/// * `personal_affinity` : fraction of comp champions already owned by the player.
/// * `overlap`           : fraction of comp champions that appear on **any** enemy board.
pub fn score(comp: &Composition, lobby: &Lobby) -> f32 {
    if comp.champions.is_empty() {
        return comp.base_power; // avoid division by zero
    }

    let total = comp.champions.len() as f32;

    let personal_affinity = personal_affinity(&lobby.my_units, comp);

    // Overlap with any enemy board
    let mut enemy_set: HashSet<&String> = HashSet::new();
    for enemy in &lobby.enemy_units {
        enemy_set.extend(enemy.iter());
    }
    let contested = comp
        .champions
        .iter()
        .filter(|c| enemy_set.contains(*c))
        .count() as f32;
    let overlap = contested / total;

    comp.base_power + 0.6 * personal_affinity - 0.4 * overlap
}

/// Fraction of composition champions already owned by the player.
pub fn personal_affinity(my_units: &Vec<String>, comp: &Composition) -> f32 {
    if comp.champions.is_empty() {
        return 0.0;
    }
    let owned = comp
        .champions
        .iter()
        .filter(|c| my_units.contains(*c))
        .count() as f32;
    owned / comp.champions.len() as f32
}

#[derive(Debug, Clone, Serialize)]
pub struct ScoredComp {
    pub name: String,
    pub score: f32,
}

pub fn best_comps(lobby_json: String) -> Result<Vec<ScoredComp>, String> {
    // Parse lobby from JSON string
    let lobby: Lobby = serde_json::from_str(&lobby_json).map_err(|e| e.to_string())?;

    // Load compositions from file
    let comps_path: PathBuf = ["data", "latest", "comps.json"].iter().collect();
    let file_content = fs::read_to_string(&comps_path)
        .map_err(|e| format!("Failed to read {:?}: {}", comps_path, e))?;

    let comps: Vec<Composition> = serde_json::from_str(&file_content)
        .map_err(|e| format!("Failed to parse compositions JSON: {}", e))?;

    // Score each composition
    let mut scored: Vec<ScoredComp> = comps
        .iter()
        .map(|c| ScoredComp {
            name: c.name.clone(),
            score: score(c, &lobby),
        })
        .collect();

    // Sort descending
    scored.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

    // Keep top 3
    scored.truncate(3);
    Ok(scored)
}

/// Trigger the JS/TS data pipeline to refresh patch + comps.
/// Executes `npm run fetch-meta && npm run build-comps` in the project root.
pub fn update_meta() -> Result<(), String> {
    // Determine shell prefix based on platform
    #[cfg(target_os = "windows")]
    let (shell, flag) = ("cmd", "/C");
    #[cfg(not(target_os = "windows"))]
    let (shell, flag) = ("sh", "-c");

    let cmd = "npm run fetch-meta && npm run build-comps";

    let status = std::process::Command::new(shell)
        .arg(flag)
        .arg(cmd)
        .status()
        .map_err(|e| format!("Failed to spawn process: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Process exited with status {status}"))
    }
}

/// Struct returned by the Python YOLO detector.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitDetection {
    pub champ: String,
    pub x: i32,
    pub y: i32,
    pub conf: f32,
}

pub fn detect_units(path: String) -> Result<Vec<UnitDetection>, String> {
    // Determine python executable name – prefer `python3` on *nix.
    #[cfg(target_os = "windows")]
    let python = "python";
    #[cfg(not(target_os = "windows"))]
    let python = "python3";

    // Build script path relative to executable: ../scripts/detect_units.py
    let script_path: PathBuf = ["scripts", "detect_units.py"].iter().collect();
    if !script_path.exists() {
        return Err(format!(
            "Python detector script not found at {:?}. Have you run the project from repo root?",
            script_path
        ));
    }

    let output = Command::new(python)
        .arg(script_path)
        .arg(&path)
        .output()
        .map_err(|e| format!("Failed to spawn python: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Python detector exited with status {:?}: {}",
            output.status.code(),
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = str::from_utf8(&output.stdout)
        .map_err(|e| format!("Invalid UTF-8 from detector: {}", e))?;

    let detections: Vec<UnitDetection> = serde_json::from_str(stdout)
        .map_err(|e| format!("Failed to parse detector JSON: {}", e))?;

    Ok(detections)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn approx_eq(a: f32, b: f32, eps: f32) -> bool {
        (a - b).abs() < eps
    }

    #[test]
    fn test_score_basic() {
        let comp = Composition {
            name: "Mage Core".into(),
            champions: vec![
                "A".into(),
                "B".into(),
                "C".into(),
                "D".into(),
            ],
            base_power: 2.0,
        };

        let lobby = Lobby {
            my_units: vec!["A".into(), "E".into()],
            enemy_units: vec![vec!["F".into()], vec!["B".into(), "G".into()]],
        };

        // personal_affinity = 1/4, overlap = 1/4
        let expected = 2.0 + 0.6 * 0.25 - 0.4 * 0.25; // 2.05
        let result = score(&comp, &lobby);
        assert!(approx_eq(result, expected, 1e-5));
    }

    #[test]
    fn test_score_no_overlap_full_owned() {
        let comp = Composition {
            name: "Full Board".into(),
            champions: vec!["X".into(), "Y".into()],
            base_power: 1.0,
        };
        let lobby = Lobby {
            my_units: vec!["X".into(), "Y".into()],
            enemy_units: vec![vec!["Z".into()]],
        };

        // personal_affinity = 1, overlap = 0
        let expected = 1.0 + 0.6 * 1.0 - 0.4 * 0.0; // 1.6
        let result = score(&comp, &lobby);
        assert!(approx_eq(result, expected, 1e-5));
    }

    #[test]
    fn test_affinity_none() {
        let comp = Composition { name: "Test".into(), champions: vec!["A".into(), "B".into()], base_power: 0.0 };
        let my_units = vec!["C".into()];
        assert_eq!(personal_affinity(&my_units, &comp), 0.0);
    }

    #[test]
    fn test_affinity_partial() {
        let comp = Composition { name: "Test".into(), champions: vec!["A".into(), "B".into(), "C".into()], base_power: 0.0 };
        let my_units = vec!["C".into(), "X".into()];
        assert!(approx_eq(personal_affinity(&my_units, &comp), 1.0/3.0, 1e-5));
    }

    #[test]
    fn test_affinity_full() {
        let comp = Composition { name: "Test".into(), champions: vec!["A".into(), "B".into()], base_power: 0.0 };
        let my_units = vec!["A".into(), "B".into(), "Z".into()];
        assert_eq!(personal_affinity(&my_units, &comp), 1.0);
    }
} 