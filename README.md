# NEXUS FM — Data Center Digital Twin

以數據中心為情境的 3D 設施管理作品。畫面不是靜態 Dashboard：資產樹、WebGL 建築、樓層狀態與告警共用同一份狀態；Node 服務透過 REST 提供資產資料，並以 WebSocket 推送即時能耗。

## 功能亮點

- React Three Fiber 3D 建築：旋轉、縮放、樓層選取、設備標籤與狀態視覺化
- 樓層樹、3D 場景、右側營運面板三方同步
- REST API + WebSocket 即時 PUE、功率與冷卻用電
- 告警確認流程，保留處理歷史而非直接刪除
- SCSS 設計 token 與桌機、平板、手機三段 RWD
- Zustand 狀態模組與 Vitest 核心流程測試

## 本機啟動

```bash
npm install
npm run server
```

另開終端機：

```bash
npm run dev
```

開啟 `http://localhost:5173`。若 API 未啟動，前端會自動切換到本地即時資料模擬，方便單獨展示。

## 架構決策

```text
Node REST / WebSocket
         ↓
   realtime adapter
         ↓
     Zustand store
      ↙    ↓    ↘
資產樹   3D 場景   營運面板
```

即時傳輸集中在 `useRealtime`，未來可替換成 RxJS 或正式 IoT broker 而不影響畫面元件。3D 模型目前由程式化幾何建立，避免作品載入大型 BIM 檔；模型層獨立於營運資料，後續可換成 IFC/GLTF loader。

## API

| Method | Endpoint | 說明 |
| --- | --- | --- |
| GET | `/api/health` | 服務健康狀態 |
| GET | `/api/floors` | 樓層與環境摘要 |
| GET | `/api/telemetry` | 最新營運數據 |
| WS | `/ws` | 每 3 秒推送即時數據 |

## 驗證

```bash
npm run test
npm run build
```
