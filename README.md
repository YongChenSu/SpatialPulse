# NEXUS FM — Smart Campus & Facility Digital Twin

結合 Web GIS 與建築數位孿生的智慧園區設施管理作品。使用 CesiumJS 從園區尺度查看建築、設備與告警，再進入 React Three Fiber 建築場景定位樓層和設備。Node 服務透過 REST 提供園區與資產資料，並以 WebSocket 推送即時能耗。

## 功能亮點

- CesiumJS 智慧園區 GIS：園區邊界、3D 建築、設備點位與圖層切換
- 國土測繪中心 WMTS：臺灣通用電子地圖、正射影像與資料來源標示
- 依建築群 BoundingSphere 自動定位園區，適應不同螢幕比例
- 建築狀態驅動的地圖視覺化，以及選取建築後的 Camera fly-to
- GIS 建築資訊卡可直接進入對應的 3D 數位孿生
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
npm run server
```

另開終端機：

```bash
npm run dev
```

開啟：

- `http://localhost:5173/gis`：智慧園區 GIS
- `http://localhost:5173/buildings/a1/twin`：A1 數據中心數位孿生

若 API 未啟動，前端會自動切換到本地即時資料與園區展示資料，方便單獨展示。

## 架構決策

```text
                   React Router
                 ↙              ↘
        Cesium 園區 GIS       R3F 建築數位孿生
                 ↘              ↙
             TanStack Query + Zustand
                         ↓
                Node REST / WebSocket
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
| 臺灣通用電子地圖 | 內政部國土測繪中心 WMTS `EMAP` | 真實公開圖資 |
| 正射影像 | 內政部國土測繪中心 WMTS `PHOTO2` | 真實公開圖資 |
| 深色營運底圖 | OpenStreetMap / CARTO | 真實公開圖資 |
| 示範建築、設備與告警 | SpatialPulse scenario dataset | 模擬資料 |

介面會區分真實公開資料與 Demo 模擬資料，不將示範 IoT 數值宣稱為特定建築的真實營運資料。

## 驗證

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```
