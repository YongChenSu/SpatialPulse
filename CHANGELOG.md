# Changelog

本文件記錄 SpatialPulse 可被使用者看見的功能、架構里程碑與重要修正。格式參考 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，目前尚未建立正式版號，先以日期整理階段成果。

更完整的研究過程、資料評估與未完成事項收錄在 [`docs/devlog/`](docs/devlog/README.md)。

## [Unreleased]

### Planned

- 將全市背景建物與 2025 產權建物拆成獨立頁面。
- 以長虹雲端科技大樓（使用執照 `110使字84`）作為第一個真實建物基底的數位孿生案例。
- 驗證 NLSC 建物與臺北市產權模型的水平座標對位。
- 決定城市背景、可選取建物外殼與產權屬性的 mapping 方式。
- 完成 NLSC 2025 臺北市建物 local snapshot。
- local 驗證完成後，再評估發布到 R2、S3 或 CDN。

### Known issues

- `CB_2025_20250825` 是產權樓層與附屬建物幾何，不等同正射影像中的建築屋頂外殼。
- 斜視相機下，貼地正射影像與具有高度的 3D 模型會產生視差；仍需以多個俯視控制點確認是否另有水平偏移。

## [2026-11-02] - NLSC 2025 建物與本機發布工具

### Added

- 接入國土測繪中心 `114_A` 2025 臺北市分棟建物 I3S。
- 新增 NLSC 建物來源 manifest。
- 新增 I3S snapshot publish、validate 與 local SceneServer 工具。
- 新增環境變數，可分別指向本機產權模型與城市背景服務。
- 擴充 E2E，確認兩個 I3S 來源會實際發出請求。

### Changed

- 以 NLSC 2025 建物取代舊的 `LOD1_2017` 作為城市背景來源。
- 下載器支援目前來源的 node page 與 resource layout。
- 對上游缺少非必要 texture 的情況加入容錯。

## [2026-11-01] - Self-hosted GIS data pipeline

### Added

- 建立集中式 GIS source registry。
- 新增 I3S inventory 工具，盤點版本、節點、欄位與渲染 workload。
- 新增可中斷續傳、atomic write、concurrency 與 timeout 控制的 I3S 下載器。
- 完成 `CB_2025_20250825` 本機 snapshot。
- 新增 `data/raw`、`data/processed` 與 `data/manifests` 分層規則。

### Changed

- 大型 GIS 原始資料不再納入 Git，只提交 script、manifest 與文件。

## [2026-10-31] - 真實臺北城市場景

### Added

- 建立 Layer Catalog、CesiumLayerManager 與 camera scale policy。
- 接入臺北市 `CB_2025_20250825` 三維產權建物。
- 支援建物 feature picking 與門牌、樓層、用途、建材等屬性。
- 新增圖層 loading、ready、error 與 retry 狀態。
- 新增 GIS store、runtime 與資料解析測試。

### Changed

- GIS 頁面只呈現來源可追溯的真實城市圖資。
- 移除放置在真實地圖上的 Demo Cesium Box。
- 將模擬建築與 IoT 營運資料保留在 Facility Management Demo。

## [2026-10-30] - GIS command center 與設施數位孿生

### Added

- 建立 CesiumJS Smart Campus GIS command center。
- 接入 NLSC `EMAP16` 電子地圖與 `PHOTO2` 正射影像。
- 建立 React Three Fiber 建築數位孿生。
- 完成樓層、設備、即時 telemetry、告警與維護互動。
- 建立 Node.js REST API 與 WebSocket 即時推送。
- 完成桌機、平板與手機版 RWD。

### Fixed

- 移除會顯示 `API KEY REQUIRED` 佔位圖的 CARTO 底圖。
- 修正 Cesium Assets 與 Workers 靜態路徑造成的 rendering stopped 問題。

[Unreleased]: https://github.com/YongChenSu/SpatialPulse/compare/feat/smart-campus-gis...HEAD
[2026-11-02]: https://github.com/YongChenSu/SpatialPulse/commit/c8b4b87
[2026-11-01]: https://github.com/YongChenSu/SpatialPulse/commit/8172239
[2026-10-31]: https://github.com/YongChenSu/SpatialPulse/commit/98a1775
[2026-10-30]: https://github.com/YongChenSu/SpatialPulse/commit/e85ea15
