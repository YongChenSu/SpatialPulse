# SpatialPulse GIS 開發紀錄：從 Demo 建築到真實臺北三維城市

| 項目 | 內容 |
| --- | --- |
| 整理日期 | 2026-11-02 |
| 專案 | SpatialPulse |
| 開發分支 | `feat/smart-campus-gis` |
| 目前 HEAD | `c8b4b87 feat: adopt NLSC 2025 Taipei buildings` |
| 產品定位 | 智慧園區、三維城市 GIS、建築與設施營運平台 |
| 文件用途 | 開發紀錄、作品集素材、後續 GIS 實作依據 |

## 1. 為什麼開始重做 GIS

SpatialPulse 最初以單一企業的園區設施管理為核心，畫面包含建築、樓層、設備、即時數據、告警與維護資訊。這套介面適合展示 Facility Management 與 IoT 整合能力，但早期 GIS 畫面中的建築只是放在真實座標附近的 Cesium Box。

當底圖換成電子地圖或正射影像後，模擬建築與真實城市輪廓之間的落差變得非常明顯。這代表只把一個漂亮的 3D 模型放到地圖上，並不能稱為可信的 GIS 系統。

因此這一階段的核心目標改成：

1. GIS 頁面只呈現來源可追溯的真實城市圖資。
2. 模擬營運資料仍保留在 Facility Management Demo，但不冒充真實城市資料。
3. 建立可以下載、驗證、發布大型 I3S 資料的本機管線。
4. 將城市概覽、建物選取與未來 IoT 營運圖層拆成不同責任。

## 2. 目前完成的產品功能

### 2.1 Facility Management 主場景

原本的設施管理功能仍是產品的重要部分，目前包含：

- React Three Fiber 建築場景。
- 樓層樹與 3D 場景同步操作。
- 設備標籤與設備狀態視覺化。
- 功率、PUE、冷卻用電及環境指標。
- 告警列表與確認流程。
- Node.js REST API 與 WebSocket 即時資料。
- API 無法使用時的本地資料降級。
- 桌機、平板與手機版 RWD。

這一區仍屬於產品情境 Demo，營運數值並不代表真實案場。

### 2.2 `/gis` 真實城市場景

GIS 頁已從原本的模擬園區場景重構成 CesiumJS 城市場景，目前具備：

- 臺北市三維建物顯示。
- 電子地圖、正射影像與中性底圖切換。
- 建物 I3S feature picking。
- 門牌、樓層、用途、建材及高度欄位顯示。
- 相機定位與依高度切換資訊尺度。
- 圖層 loading、ready、error 與 retry 狀態。
- 圖資來源與座標系統標示。
- Cesium 與其他頁面分離並依路由 lazy-load。

GIS 頁不再顯示 A1、A2、B1 等 Demo Box，也暫時不顯示模擬 CCTV、感測器或巡檢車。

## 3. 使用的真實資料來源

| 資料 | 來源 | 用途 | 目前狀態 |
| --- | --- | --- | --- |
| `EMAP16` | 內政部國土測繪中心 | 低干擾電子地圖 | 已接入 |
| `PHOTO2` | 內政部國土測繪中心 | 正射影像與位置查核 | 已接入 |
| `CB_2025_20250825` | 臺北市政府 | 產權樓層、附屬建物與公開屬性 | 已接入、可選取 |
| `114_A` | 國土測繪中心 | 2025 臺北市分棟建物城市背景 | 已接入 |
| `LOD1_2017` | 臺北市歷史圖資 | 舊版全市 LOD1 建物 | 已淘汰，不再是現行來源 |

### 3.1 CB_2025 並不是建築外觀模型

`CB_2025_20250825` 雖然包含大量三維細節與可查詢欄位，但它的語意是產權樓層、主要建物、附屬建物與共有部分，不是 photogrammetry，也不是依屋頂外型建立的建築外殼。

因此它適合：

- 查詢門牌與樓層。
- 顯示主要用途及建材。
- 進行產權與空間屬性選取。
- 作為後續 building mapping 的資料來源。

但不能直接把它描述成與正射影像屋頂完全吻合的「精緻建築外觀模型」。

### 3.2 NLSC 114_A 的角色

`114_A` 是目前採用的 2025 臺北市分棟建物來源。相較於舊的 `LOD1_2017`，它更新，也更適合用來建立整座城市的低干擾背景量體。

在產品語意上，預計把它當成：

- 城市尺度的背景建物。
- 不強調單棟細節的空間參考。
- 相機移動及城市輪廓判讀用圖層。

## 4. GIS 前端架構重構

這次沒有繼續把所有 Cesium 邏輯堆在單一 React component，而是拆成數個責任層。

```text
src/features/gis/
├── catalog/
│   ├── basemaps.ts
│   └── layerCatalog.ts
├── layers/
│   ├── TaipeiContextBuildingsLayer.ts
│   └── TaipeiOfficialBuildingsLayer.ts
├── runtime/
│   ├── CesiumLayerManager.ts
│   ├── cameraScalePolicy.ts
│   └── types.ts
├── scene/
│   ├── CityScene.tsx
│   └── cameraPresets.ts
├── services/
│   ├── taipeiBuildings.ts
│   └── taipeiContextBuildings.ts
└── store/
    └── useCitySceneStore.ts
```

### 4.1 Layer Catalog

Catalog 保存圖層的產品定義，例如名稱、來源、用途、是否延遲載入及 UI badge。React UI 從 catalog 產生選單，不需要另外維護一份 hard-coded 圖層清單。

### 4.2 Layer Runtime

每個 Cesium 圖層實作統一生命週期：

```ts
interface CityLayerRuntime {
  load(context: CityLayerContext): Promise<void>
  setVisible(visible: boolean): void
  setCameraScale?(scale: CameraScale): void
  destroy(): void
}
```

### 4.3 CesiumLayerManager

`CesiumLayerManager` 負責：

- 圖層首次開啟時才建立 provider。
- 防止相同圖層重複載入。
- 保存使用者希望的可見狀態。
- 圖層載入完成後再套用最新狀態。
- 依 camera scale 調整 screen-space error。
- Viewer 銷毀時清理 primitive 與資源。

Cesium Viewer、I3S provider 和 primitive 不放進 Zustand。Zustand 只保存可序列化的 UI 意圖、選取內容與載入狀態。

## 5. 底圖處理

早期版本使用 CARTO dark tiles，但服務回傳的是 `API KEY REQUIRED` 佔位圖，而且 HTTP status 仍可能是 200。這使得只檢查 network status 的測試無法發現問題。

目前已完成：

- 移除 CARTO 依賴。
- 改用 NLSC 官方 WMTS。
- 提供 `EMAP16` 與 `PHOTO2`。
- 保留不載入 raster 的中性城市模式。
- 在 E2E 中禁止再次發出 CARTO tile request。
- 調整正射影像亮度、對比、飽和度與透明度，降低對營運介面的干擾。

## 6. 自架 GIS 資料管線

城市級 I3S 不適合直接放進 Git，也不應讓前端一次下載完整資料。為了先在 local 驗證，再考慮 S3、R2 或 CDN，專案已建立一套本機資料工具。

### 6.1 Source registry

目前正式登錄的來源：

```text
taipei-cadastral-2025
taipei-buildings-2025-nlsc
```

來源 URL、dataset 名稱與圖層角色集中在 `scripts/gis/sources.mjs`，避免散落在多支下載 script。

### 6.2 Inventory

Inventory 只盤點服務 metadata，不下載完整模型：

```bash
npm run gis:inventory -- --source taipei-cadastral-2025
npm run gis:inventory -- --source taipei-buildings-2025-nlsc
```

輸出內容包含：

- I3S 版本。
- node page 數量。
- mesh node 數量。
- 欄位名稱。
- feature 與 vertex workload。
- 來源網址及更新時間。

Inventory 中跨 LOD 的 feature 總數不是唯一建物數量，不能直接當成臺北市建築總數。

### 6.3 Download、publish、validate、serve

完整流程如下：

```bash
npm run gis:download -- --source taipei-cadastral-2025 --all
npm run gis:publish -- --source taipei-cadastral-2025 --force
npm run gis:validate -- --source taipei-cadastral-2025
npm run gis:serve -- --source taipei-cadastral-2025 --port 4174
```

NLSC context layer 可使用較小的 render profile：

```bash
npm run gis:download -- \
  --source taipei-buildings-2025-nlsc \
  --all \
  --profile render \
  --concurrency 2 \
  --timeout-ms 60000
```

下載器具備：

- I3S node page traversal。
- I3S 1.7、1.8 與目前來源 resource layout 支援。
- 中斷後繼續下載。
- atomic file write。
- concurrency 與 timeout 控制。
- 可選擇完整資料或 render-only profile。
- 對上游缺少非必要 texture 的容錯。
- 本機 SceneServer 路徑模擬。

### 6.4 目前 local 資料狀態

| 本機資料 | 約略大小 | 狀態 |
| --- | ---: | --- |
| `data/processed/taipei-cadastral-2025/` | 824 MB | snapshot 標記為 complete |
| `data/raw/taipei-buildings-2025-nlsc/` | 65 MB（raw 總量） | snapshot 尚未 complete，目前只記錄少量已下載節點 |
| `data/processed/taipei-lod1-2017/` | 185 MB | 舊來源，可清理 |

大型 raw 與 processed 資料不進 Git；Git 只保存小型、可 review 的 manifest、script 與文件。

## 7. 圖層重疊後的產品決策

實作 NLSC 建物與 CB_2025 後，發現兩個模型在部分區域會重疊，而且它們代表的幾何語意並不相同。因此不應把兩者當成可以任意同時打開的 checkbox。

目前 stash 中已完成一版互斥模式設計：

### 城市概覽

- 只顯示 NLSC 114_A。
- 使用低對比、低透明度城市量體。
- 使用較大的 screen-space error，降低背景細節及成本。
- 不提供建物選取。

### 建物檢視

- 先關閉城市背景，再載入 CB_2025。
- CB_2025 採 load-on-demand。
- 允許 feature picking 與公開屬性查詢。
- 切回城市概覽時清除選取狀態。
- 已處理快速切換時兩個非同步圖層短暫同時出現的 race condition。

這些修改目前保存在：

```text
stash@{0}: wip: separate GIS modes and audit building alignment
```

尚未進入目前分支 HEAD。

## 8. 座標與對位問題

目前最重要的未解問題，是 CB_2025 在正射影像上看起來存在明顯偏移。

### 8.1 已確認的 metadata

CB_2025 宣告：

```text
horizontal CRS: EPSG:4326
vertical CRS: EPSG:5773
height model: gravity_related_height
vertCRS: EGM96_Geoid
```

NLSC WMTS 使用 GoogleMapsCompatible / Web Mercator。Cesium 可以在 EPSG:4326 與 Web Mercator 之間進行正常轉換，因此目前不能只根據截圖就認定是 CRS 設定錯誤。

### 8.2 Geoid 高程轉換

Cesium 文件指出，gravity-related height 的 I3S 應提供 geoid tiled terrain provider，才能轉換成 WGS84 ellipsoidal height。stash 中已加入共用的 geoid provider，避免兩個圖層各自重複建立服務。

這項修正只處理垂直基準，不等於水平 XY 校正。

### 8.3 為什麼斜視截圖可能看起來偏移

正射影像是 2D raster，會貼在橢球或地表上；3D 模型則具有真實高度。使用斜視相機時，模型頂部與貼地影像會因高度產生畫面視差。高度修正後，這種視差甚至可能更明顯。

此外，CB_2025 包含：

- 各樓層產權幾何。
- 地下層。
- 附屬建物。
- 共有部分。

所以其輪廓本來就不一定等於正射影像中的屋頂輪廓。

### 8.4 目前不能做的事

在尚未取得多個控制點之前，不應直接把整個圖層「往東移幾公尺」或「往北移幾公尺」。單點人工平移可能讓一棟建物看起來正確，卻讓其他區域更不準確。

### 8.5 stash 中的俯視對位工具

為了排除斜視視差，stash 中加入了「俯視對位」模式：

- 以目前 viewport 中心為目標。
- 保存使用者原本的透視 camera pose。
- 將相機切換到 `pitch = -90°`。
- 返回時恢復原本視角。
- 已加入 Zustand state、UI 狀態與 Playwright E2E。

下一步應在俯視狀態下，選擇至少 3 至 5 個分布於不同區域的控制點，比較建物底部輪廓：

1. 若誤差方向與距離固定，可考慮平移校正。
2. 若誤差隨位置改變，需評估 affine transform 或來源資料投影問題。
3. 若只有樓頂或高樓明顯偏移，主要原因是視差或高度基準。
4. 若產權幾何與屋頂形狀不同，則應更換 visual geometry，而不是修改座標。

## 9. 測試與穩定性

目前已建立的測試範圍包含：

- GIS store 行為。
- Camera scale policy。
- CesiumLayerManager lifecycle。
- I3S feature 欄位解析。
- 公開資料來源設定。
- 禁止 CARTO request。
- Cesium render loop 不得停止。
- I3S 圖層必須實際發出請求。
- 上游非必要 texture 缺失容錯。
- 圖層互斥與 load-on-demand（stash）。
- 俯視對位與返回透視（stash）。

stash 前最後一次完整驗證結果：

```text
Vitest: 21 tests passed
ESLint: passed
Production build: passed
Playwright GIS E2E: passed
```

## 10. 重要 commits

| Commit | 內容 |
| --- | --- |
| `e85ea15` | 建立 Smart Campus GIS command center |
| `4ebb563` | 擴充底圖與 GIS 測試 |
| `98a1775` | 將 GIS 重構為真實城市場景，移除 Demo Box |
| `8172239` | 建立可 self-host 的 GIS inventory 與下載管線 |
| `c8b4b87` | 採用 NLSC 2025 臺北市建物來源，加入 publish、validate、serve 工具 |

目前本機分支比 `origin/feat/smart-campus-gis` 多出後面三個 commits，尚未 push。

## 11. 目前工作目錄狀態

正式程式修改已放進 `stash@{0}`，工作目錄只剩：

```text
data/manifests/taipei-lod1-2017.inventory.json
```

這是舊 `LOD1_2017` 來源的 inventory 報告，不是模型本身，也不被目前程式引用。現行 source registry 已經沒有 `taipei-lod1-2017`，因此這個未追蹤檔案可以清理。

## 12. 下一階段

### 優先級一：完成對位稽核

- 恢復 `stash@{0}`。
- 使用俯視模式選定多個控制點。
- 記錄模型與底圖誤差方向及距離。
- 判斷是視差、垂直基準、來源幾何語意，還是水平 transform。
- 將稽核結果寫入 manifest 或獨立 QA 報告。

### 優先級二：確定互動建物來源

如果 CB_2025 不適合作為視覺外殼，可評估：

- NLSC 建物作為可見、可點選的外殼。
- CB_2025 作為隱藏的產權屬性來源。
- 以空間 join 或建物 mapping 將兩者關聯。
- 點選外殼後再查詢產權、設備與營運資料。

### 優先級三：完成 NLSC local snapshot

- 完整下載或按指定臺北區域裁切。
- publish 成前端可直接串流的版本。
- validate node、geometry、texture 與 attribute layout。
- local 驗證完成後，再決定是否發布到 R2、S3 或 CDN。

### 優先級四：接回設施營運資料

在真實建物 mapping 完成前，不把 Demo IoT 點位重新放回城市場景。Mapping 完成後再逐步加入：

- 告警熱點。
- CCTV。
- 環境感測器。
- 能耗圖層。
- 維護工單。
- 從城市、園區、建築、樓層到設備的 drill-down。

## 13. 這一階段最重要的收穫

這次實作不只是把 Cesium 畫面做得更漂亮，而是建立了幾個對真實 Web GIS 專案更重要的能力：

1. 區分 Demo、公開資料與真實營運資料。
2. 理解 I3S、LOD、node page、geometry 與 attribute 的資料結構。
3. 不把大型 GIS raw data 直接塞進 Git 或前端 bundle。
4. 以 catalog、runtime 與 store 分離 Cesium 資源生命週期。
5. 用 E2E 捕捉「HTTP 200 但內容不可用」的底圖問題。
6. 在調整座標前，先確認 CRS、垂直基準、相機視差與來源幾何語意。
7. 把城市背景、建物選取與營運資料視為不同產品功能，而不是幾個可以隨意疊加的 checkbox。

這些內容也會是 SpatialPulse 作為 Blog 主力作品時，比單純展示 dashboard 截圖更有價值的部分。
