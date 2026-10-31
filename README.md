# SpatialPulse — 3D City GIS & Facility Digital Twin

結合真實城市 Web GIS 與建築數位孿生的設施管理作品。CesiumJS 城市場景使用 NLSC 底圖與臺北市官方 I3S 三維建物；React Three Fiber 建築場景則以獨立 Demo 資料呈現樓層、設備與即時營運流程。

## 功能亮點

- CesiumJS 三維城市 GIS：臺北市官方 I3S 建物、建物選取與公開屬性
- 國土測繪中心 WMTS：臺灣通用電子地圖、正射影像與資料來源標示
- 中性城市、地理位置與正射影像三種底圖模式
- 城市 Layer Catalog、南港相機 preset 與官方資料載入狀態
- Cesium Layer Manager 統一處理圖層 lazy-load、可見性、重試與銷毀
- 相機高度驅動城市／街廓／建物尺度，動態調整 I3S LOD
- GIS 與 Demo 營運資料解耦，避免將模擬設備錯誤綁定真實建物
- React Three Fiber 3D 建築：旋轉、縮放、樓層選取、設備標籤與狀態視覺化
- 樓層樹、3D 場景、右側營運面板三方同步
- REST API + WebSocket 即時 PUE、功率與冷卻用電
- 告警確認流程，保留處理歷史而非直接刪除
- SCSS 設計 token 與桌機、平板、手機三段 RWD
- Zustand 狀態模組與 Vitest 核心流程測試
- TanStack Query 管理園區 REST 資料，API 不可用時降級至展示資料
- Cesium 與 Three.js 依路由 lazy-load，不會同時載入兩套 3D 引擎

## 本機啟動

```bash
npm install
npm run dev
```

`/gis` 不需要 Demo API 即可使用。若要體驗數位孿生的 REST 與 WebSocket 即時資料，另開終端機：

```bash
npm run server
```

開啟：

- `http://localhost:5173/gis`：臺北市三維城市 GIS
- `http://localhost:5173/buildings/a1/twin`：A1 數據中心數位孿生

若 API 未啟動，數位孿生頁會自動切換到本地展示資料。

## 架構決策

```text
                   React Router
                 ↙              ↘
       Cesium 城市 GIS        R3F 建築數位孿生
       NLSC + 官方 I3S         Demo facility data
                ↓                       ↓
      City Scene Zustand       Query + Node REST / WS
```

即時傳輸集中在 `useRealtime`，未來可替換成 RxJS 或正式 IoT broker 而不影響畫面元件。3D 模型目前由程式化幾何建立，避免作品載入大型 BIM 檔；模型層獨立於營運資料，後續可換成 IFC/GLTF loader。

## API

| Method | Endpoint | 說明 |
| --- | --- | --- |
| GET | `/api/health` | 服務健康狀態 |
| GET | `/api/floors` | 樓層與環境摘要 |
| GET | `/api/telemetry` | 最新營運數據 |
| GET | `/api/sites` | 可查看的園區列表 |
| GET | `/api/sites/:siteId` | 園區營運摘要 |
| GET | `/api/sites/:siteId/buildings` | 園區建築與空間資料 |
| GET | `/api/buildings/:buildingId` | 建築營運摘要 |
| WS | `/ws` | 每 3 秒推送即時數據 |

## GIS 資料來源

| 圖層 | 來源 | 類型 |
| --- | --- | --- |
| 地理位置圖 | 內政部國土測繪中心 WMTS `EMAP16` | 真實公開圖資 |
| 正射影像 | 內政部國土測繪中心 WMTS `PHOTO2` | 真實公開圖資 |
| 中性城市圖 | SpatialPulse 本地 Globe | 不依賴外部圖磚 |
| 三維產權建物 | 臺北市政府 I3S SceneServer | 真實公開圖資 |
| 示範建築、設備與告警 | SpatialPulse scenario dataset | 模擬資料，不載入 GIS |

GIS 目前只呈現可追溯的公開城市圖資。示範 IoT 數值不會宣稱為特定真實建物的營運資料，必須等建物 mapping 完成後才會重新接入。

## 驗證

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```
