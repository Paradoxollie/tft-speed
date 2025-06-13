# TFT Speed – Real-Time Strategy Overlay

![Screenshot](docs/screenshot.png)
<!-- TODO: replace with real screenshot or architecture diagram -->

## Goal
Deliver an always-on-top desktop overlay for Riot's Teamfight Tactics that reads the live board, predicts best plays, and surfaces real-time strategy tips without alt-tabbing.

## Features
- Native desktop window with negligible overhead (Tauri + Rust core)
- Svelte UI rendered as HTML/CSS but accelerated by GPU
- Python-powered OCR detects champions, items, and augments in milliseconds
- Rust engine evaluates board state and returns best comps via WASM
- TypeScript pipeline keeps meta & patch data fresh
- Seamless auto-updates shipped through GitHub Releases

## Tech Stack

| Layer           | Technology                  | Why                             |
|-----------------|-----------------------------|---------------------------------|
| Desktop Shell   | **Tauri** + **SvelteKit**   | Small footprint & rapid UI dev  |
| Core Engine     | **Rust**                    | Deterministic, fast evaluation  |
| Data Pipeline   | **TypeScript / Node.js**    | Easy JSON ↔ API transformation  |
| Vision          | **Python 3 + OpenCV + Tesseract** | Accurate, flexible OCR   |

## Prerequisites
- Node 18+
- Rust 1.76+
- Python 3.11+
- pnpm (or npm/yarn)

## Getting Started (Development)
```bash
# Clone source
 git clone https://github.com/yourname/tft-speed.git
 cd tft-speed

# Install JS deps
 pnpm install "--frozen-lockfile"

# Build Rust once for faster hot-reload
 cargo build --release

# Run everything (Vite + Tauri + OCR)
 pnpm dev
```
The first run downloads Riot assets & fonts automatically.

## Production Build
```bash
# Bundle UI & compile Rust → WASM
 pnpm build

# Create native installers (dmg, msi, AppImage…)
 cargo tauri build
```
Outputs land in `src-tauri/target/release/bundle/`.

## Auto-Update Flow
1. CI/CD tags a semantic version and uploads installers to **GitHub Releases**.
2. `tauri.conf.json` embeds public signature keys and release URL.
3. On startup the built-in Tauri updater queries the latest Release;
   if a newer version exists it downloads, verifies, and applies in place.
4. Users can postpone or disable via `Settings → Updates` or `--no-update` flag.

## Directory Map
```
.
├── apps/overlay/   # Svelte frontend
├── engine/         # Rust strategy core
├── ocr/            # Python OCR microservice
└── scripts/        # TypeScript data jobs
```

## Development Tips
- `pnpm dev -- --open` launches the UI in browser for layout tweaking.
- Use `cargo watch -x run` to hot-reload the Rust engine.
- OCR service auto-reloads with `uvicorn main:app --reload`.

## Contributing
Issues & PRs welcome! Please follow the code style enforced by `prettier`, `rustfmt`, and `black`.

## License
MIT © 2024 Your Name 