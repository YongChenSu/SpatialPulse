# SpatialPulse GIS 資料與圖層架構設計

| 項目 | 內容 |
| --- | --- |
| 文件日期 | 2026-10-31 |
| 文件狀態 | 已確認方向，作為後續重構依據 |
| 適用範圍 | `/gis` 園區 GIS、官方三維建物、設施設備與即時 IoT 圖層 |
| 參考專案 | `ianlkl11234s/mini-taiwan-learning-project` |

## 1. 文件目的

目前 SpatialPulse 的 GIS 功能包含設備點位、NLSC 底圖，以及臺北市官方 I3S 三維產權建物。第一版以 Cesium Box 建立的五棟 Demo 建築並非真實建物，已決定從 GIS 場景與圖層選單移除，不再作為城市場景的一部分。

現階段不急著把模擬營運資料綁到任意一棟官方建物。應先把整個城市的底圖、建物、標籤、選取效果與縮放層級整理成一致的視覺系統，再進入真實建物識別與營運資料 mapping。GIS 主場景已由 `CampusMap` 改為 `CityScene`，並停止載入 Demo 園區邊界與設備點位；後續仍需把官方 Provider 的生命週期從 `CityScene.tsx` 拆入獨立 layer runtime。

本文件回答以下問題：

1. 現在的 GIS 資料放在哪裡。
2. 哪些資料存在 Repo，哪些由外部服務串流。
3. Mini Taiwan 如何處理大量 GIS 與交通資料。
4. 哪些作法適合 SpatialPulse，哪些不應直接照搬。
5. 未來新增大量圖層時，資料、程式與部署應如何分層。
6. 真實建物導入前，城市場景應先整理到什麼程度。

### 1.1 已確認的產品決策

- GIS 頁面不再顯示五棟方盒造型的 Demo 建築。
- 「3D 建築」圖層開關移除，避免使用者誤認為真實建物。
- 臺北市官方 I3S 是目前唯一的城市級 3D 建物來源。
- Demo 建築資料仍可供既有數位孿生與設施管理頁使用，但不代表真實城市建物，也不應出現在 GIS 城市場景。
- 真實 IoT、告警與建物的關聯，必須等真實建物識別策略完成後再建立。
- 下一階段的主要成果是「可閱讀、可操作、具層級的城市場景」，不是增加更多模擬方盒。

## 2. SpatialPulse 目前的 GIS 資料位置

目前專案沒有把大量 GIS 檔案下載到 Repo。資料主要分成「程式內 Demo 資料」與「外部服務串流資料」。

| 類型 | 目前位置 | 說明 |
| --- | --- | --- |
| Demo 設備、園區邊界與其他產品頁資料 | `src/data/campus.ts` | 只供既有設施管理與數位孿生 Demo 使用；GIS 不再載入 |
| 底圖 Provider | `src/features/gis/catalog/basemaps.ts` | NLSC `EMAP16`、`PHOTO2`、來源標示與影像樣式 |
| 臺北市官方 I3S | `src/features/gis/services/taipeiBuildings.ts` | 保存官方服務 URL、Provider 建立與安全欄位解析 |
| 城市圖層目錄 | `src/features/gis/catalog/layerCatalog.ts` | 圖層名稱、來源、類型、預設可見性與 UI metadata |
| 城市相機 preset | `src/features/gis/scene/cameraPresets.ts` | 南港城市尺度的初始位置與定位行為 |
| 圖層 Runtime | `src/features/gis/runtime/CesiumLayerManager.ts` | 統一載入、可見性、相機尺度、釋放與銷毀 |
| 官方建物 Layer | `src/features/gis/layers/TaipeiOfficialBuildingsLayer.ts` | 管理 I3S Provider、樣式與不同尺度的 LOD |
| 圖層與選取狀態 | `src/features/gis/store/useCitySceneStore.ts` | 保存圖層開關、載入狀態、重試次數與目前選取項目 |
| Cesium Viewer 與圖層生命週期 | `src/features/gis/scene/CityScene.tsx` | 建立 Viewer、底圖與官方 I3S；後續再拆入 Layer Manager |
| GIS 型別 | `src/types/gis.ts` | 圖層 ID、底圖 ID、官方建物欄位與狀態型別 |
| GIS 畫面與圖層控制 UI | `src/pages/GisPage.tsx` | 圖層開關、底圖切換與建物資訊面板 |

目前專案內沒有以下大型靜態 GIS 資料：

```text
public/data/*.geojson
public/data/*.czml
public/data/*.glb
public/data/*.3dtiles
```

臺北市官方三維建物不存放在 Repo。Cesium 會依照相機位置與可見範圍，從官方 I3S SceneServer 動態取得 metadata、tiles 與 feature 資料。

### 2.1 目前資料真實性

```text
臺北城市場景
├── NLSC 底圖／正射影像
│   └── 真實公開地理圖資
├── 臺北市官方 I3S 建物
│   ├── 幾何與安全屬性來自官方服務
│   └── 尚未與營運數據建立 mapping
└── Demo 設備與園區邊界
    ├── 座標、名稱與營運數值為模擬資料
    └── 不載入 GIS；只保留於其他產品 Demo 頁面
```

原本五棟 Demo 建築的長、寬、高只存在 `src/data/campus.ts`，不是測量或政府資料。它們不再由 `CityScene.tsx` 建立 Cesium Entity，相關 Demo 邊界與設備點位也不再載入城市場景。

## 3. Mini Taiwan 的資料處理方式

參考 Repo：

- [mini-taiwan-learning-project](https://github.com/ianlkl11234s/mini-taiwan-learning-project)
- [專案結構與資料格式](https://github.com/ianlkl11234s/mini-taiwan-learning-project#專案結構)
- [效能優化計畫](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/docs/PERFORMANCE_OPTIMIZATION_PLAN.md)

### 3.1 區分原始、處理中與前端資料

Mini Taiwan 沒有讓 React 直接解析所有原始 TDX 資料，而是分成：

```text
data/          原始資料與研究資料
scripts/       下載、清理、轉換、校正與驗證工具
public/data/   已處理、可直接提供給瀏覽器的 GeoJSON／JSON
src/hooks/     各交通系統的資料載入與 fallback
src/layers/    Mapbox／Three.js 顯示圖層
src/engines/   時間、位置與模擬運算
```

此結構的主要價值是避免將資料取得、格式清理、業務運算與畫面渲染混在一起。

### 3.2 按領域拆分資料載入

該 Repo 將台北捷運、高鐵、台鐵、高雄捷運與台中捷運拆成不同 hooks，例如：

- [`useData.ts`](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/src/hooks/useData.ts)
- [`useTraData.ts`](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/src/hooks/useTraData.ts)
- `useThsrData.ts`
- `useKrtcData.ts`
- `useKlrtData.ts`
- `useTmrtData.ts`

每個 domain 分別處理軌道、車站、時刻表與錯誤狀態，避免建立單一全能 loader。

### 3.3 合併過多的小型請求

台鐵 O-D 軌道原本需要發出約 263 個請求，後來合併成 `tracks_od_bundle.json`，將大量小請求降為一次請求。這適合大小可控、需要一起使用且更新週期一致的資料。

但合併不是越大越好。該 bundle 後來超過 Cloudflare Workers 靜態資產的 25 MiB 限制，因此改放 Cloudflare R2：

- [Deploy workflow](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/.github/workflows/deploy.yml)

這反映兩項重要原則：

1. 太多小請求會增加連線成本。
2. 單一巨大檔案會增加首次載入、記憶體與更新成本。

SpatialPulse 應依資料特性選擇合理分區，而不是只在「每筆一檔」和「全部一檔」之間二選一。

### 3.4 使用物件儲存與 HTTP 快取

Mini Taiwan 將超過部署平台限制的大型資料放到 R2，並對 `/data/*` 設定一天瀏覽器快取及一週 `stale-while-revalidate`：

- [`public/_headers`](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/public/_headers)

具內容 hash 的 JS/CSS 可以永久快取；沒有 hash、內容會更新的 GIS 資料不可直接設定永久 immutable，否則使用者可能長期取得舊版本。

### 3.5 依縮放層級控制顯示內容

該 Repo 不是在所有尺度顯示所有車站與標籤。遠距離只顯示重要車站，靠近後才顯示完整車站點與標籤。這同時改善畫面資訊層級與渲染效能。

SpatialPulse 對應策略應是：

```text
城市尺度：園區與主要場域
園區尺度：建築、重大告警與主要道路
建築尺度：CCTV、環境站與設備點位
室內尺度：樓層、空間與單一設備
```

### 3.6 圖層具備完整生命週期

Mini Taiwan 的 3D layer 實作 `onAdd`、`render` 與 `onRemove`，並在移除時清理 event listener、geometry、material 與 renderer：

- [`Train3DLayer.ts`](https://github.com/ianlkl11234s/mini-taiwan-learning-project/blob/main/src/layers/Train3DLayer.ts)

這個概念適合套用到 Cesium：每個圖層都應定義建立、顯示、隱藏、更新與銷毀方式，避免切換頁面或圖層後殘留 Provider、Primitive 或事件監聽器。

## 4. 可採用與不應照搬的部分

### 4.1 建議採用

- 區分原始資料、處理腳本與前端可用資料。
- 依資料 domain 拆分 loader、service 與 layer。
- 小型且同時使用的檔案可適度 bundle。
- 大檔案使用 CDN 或物件儲存，不放進前端 bundle。
- 設定正確的 cache policy 與資料版本。
- 依相機距離、zoom 或場景層級控制資訊密度。
- 圖層具備明確的 attach、update、visibility 與 destroy 生命週期。
- 預先計算不會頻繁改變的空間結果，避免每一幀重複運算。
- 對大量物件使用 `Map` 或空間索引，避免頻繁線性搜尋。

### 4.2 不建議直接照搬

#### 單一大型頁面管理所有圖層

Mini Taiwan 的 `App.tsx` 已包含大量 `addSource`、`addLayer`、`removeLayer` 與不同交通系統的 effect。SpatialPulse 不應讓 `CityScene.tsx` 繼續朝同樣方向成長。

#### 一進頁面就載入所有 domain

不同資料 hooks 同時掛載會讓使用者尚未使用的資料也進入網路、解析與記憶體流程。SpatialPulse 應採「首次開啟圖層才載入」，並只訂閱當前園區或相機範圍內的即時資料。

#### 將城市級資料打成單一巨大 JSON

城市級建物不適合轉成單一 GeoJSON 或 JSON bundle。建築應使用 I3S 或 3D Tiles，由引擎依視野、LOD 與 Screen Space Error 串流。

#### 複製多份高度相似的圖層 class

若每一種設備或每一個園區各自複製完整 layer class，長期會產生大量重複邏輯。應以 layer definition、共用 factory 與 adapter 組合。

## 5. SpatialPulse 目標目錄架構

建議將 GIS 重構成 feature-based 結構：

```text
src/features/gis/
├── config/
│   ├── basemaps.ts
│   └── layerCatalog.ts
├── layers/
│   ├── campus/
│   │   └── CampusBoundaryLayer.ts
│   ├── facilities/
│   │   ├── AlertsLayer.ts
│   │   ├── CctvLayer.ts
│   │   └── SensorsLayer.ts
│   └── official/
│       └── TaipeiBuildingsLayer.ts
├── runtime/
│   ├── CesiumLayerManager.ts
│   └── layerVisibilityPolicy.ts
├── services/
│   ├── taipeiBuildings.ts
│   └── facilityTelemetry.ts
├── data/
│   └── demoCampus.ts
├── store/
│   └── useCitySceneStore.ts
└── types/
    └── gis.ts

data/
├── raw/                 # 原始來源，不直接提供給前端
├── processed/           # 已轉換、待發布資料
└── manifests/           # 來源、版本、CRS、授權與品質資訊

scripts/gis/
├── fetch/
├── transform/
├── validate/
└── publish/

public/gis/
├── demo/                # 小型、可公開的展示資料
└── manifests/           # 前端可讀取的資料目錄與版本
```

此結構不必一次搬完。目前已先建立 `features/gis/catalog` 與 `features/gis/scene`，後續從新圖層開始使用，再逐步將 `CityScene.tsx` 的 Provider 邏輯移出。

## 6. Layer Catalog 與 Layer Manager

### 6.1 Layer Catalog

Layer Catalog 描述圖層是什麼，不直接保存 Cesium runtime object。

```ts
type GisLayerGroup = 'official' | 'campus' | 'facility' | 'realtime' | 'analysis'

interface GisLayerDefinition {
  id: string
  label: string
  group: GisLayerGroup
  sourceType: 'local' | 'rest' | 'websocket' | 'geojson' | 'i3s' | '3d-tiles'
  defaultVisible: boolean
  loadOnDemand: boolean
  minCameraHeight?: number
  maxCameraHeight?: number
  source: {
    organization: string
    license?: string
    updatedAt?: string
    url?: string
  }
}
```

UI 圖層選單應從 catalog 產生，不應在 `GisPage.tsx` 再維護一份獨立 hard-coded 陣列。

### 6.2 Layer Runtime

Layer Runtime 負責 Cesium 物件的實際生命週期：

```ts
interface GisLayerRuntime {
  load(context: GisLayerContext): Promise<void>
  setVisible(visible: boolean): void
  update?(payload: unknown): void
  destroy(): void
}
```

`CesiumLayerManager` 應負責：

- 首次開啟時才建立 Provider 或 Primitive。
- 防止同一圖層重複載入。
- 保存 loading、ready、error 與 retry 狀態。
- 底圖、Entity、DataSource、Primitive、I3S 與 3D Tiles 使用對應 adapter。
- 統一處理相機距離與圖層可見性。
- Viewer 銷毀時依序移除 event listener 與 Cesium resource。
- 不將 `Viewer`、Provider 或 Primitive 放入 Zustand。

Zustand 只應保存可序列化的使用者意圖與 UI 狀態：

```text
目前底圖
已開啟的 layer IDs
目前選取 feature
圖層載入狀態
篩選條件
時間範圍
```

## 7. 不同資料規模的格式選擇

| 資料規模／用途 | 建議格式與載入方式 |
| --- | --- |
| 少量園區邊界、場域範圍 | TypeScript 或小型 GeoJSON |
| 數百個設備與感測器 | REST API + Cesium Entity／Billboard Collection |
| 數千至數萬個點位 | PointPrimitiveCollection、分頁或視野範圍 API |
| 大型道路、行政區、管線 | Vector Tiles，不使用單一大型 GeoJSON |
| 城市級三維建物 | I3S 或 3D Tiles 串流 |
| BIM／高精度建築模型 | 離線轉成 3D Tiles，依 LOD 串流 |
| 即時 IoT 數據 | WebSocket 更新既有 feature 屬性，不重建幾何 |
| 歷史 telemetry | 後端依時間範圍聚合，不一次下載完整原始序列 |

## 8. 資料發布與版本策略

每一個可發布 GIS dataset 都應具有 manifest：

```json
{
  "id": "campus-boundary-demo",
  "version": "2026-10-31.1",
  "source": "SpatialPulse Demo",
  "sourceType": "simulated",
  "crs": "EPSG:4326",
  "format": "GeoJSON",
  "updatedAt": "2026-10-31T00:00:00+08:00",
  "license": "project-demo-only",
  "quality": "demo",
  "url": "/gis/demo/campus-boundary.2026-10-31.1.geojson"
}
```

建議 cache policy：

| 資產 | Cache-Control |
| --- | --- |
| 帶內容 hash 或版本號的靜態 GIS 檔案 | 長期快取、immutable |
| 沒有 hash 的 manifest | 短期快取或 no-cache |
| 會每日更新的公開資料 | 合理 max-age + stale-while-revalidate |
| 即時設備狀態 | 不依賴靜態 HTTP cache |

大型資料部署到 CDN／R2／S3；Repo 只保存來源說明、處理腳本、schema、manifest 與少量測試 fixture。

## 9. 圖層載入與顯示政策

### 9.1 載入政策

- 預設只載入園區營運必需圖層。
- 官方 I3S、正射影像與分析圖層採 load-on-demand。
- 已載入圖層可以先隱藏而不立即銷毀，避免短時間切換重載。
- 設定記憶體門檻或離開場景時間，必要時真正 destroy。
- 使用 `AbortController` 取消可取消的 REST／GeoJSON 請求。
- I3S／3D Tiles 依靠 Cesium 本身的 tile request 與 cache，不自行下載整份模型。

### 9.2 顯示政策

```text
城市尺度
└── 園區名稱、主要場域、城市背景建築

園區尺度
└── 建築名稱、健康狀態、重大告警

建築尺度
└── CCTV、環境站、出入口與巡檢車

室內尺度
└── 樓層、空間、設備與即時數據
```

狀態色應集中在輪廓、光暈或 marker，周邊官方建築保持中性色，避免整座城市被營運狀態色填滿。

## 10. 真實建物導入前的城市場景設計

城市場景不是把底圖、I3S 和設備點全部打開。使用者首先需要理解「目前在哪裡、看到什麼尺度、哪些資訊可操作」。因此應建立固定的圖層順序與相機尺度規則。

### 10.1 圖層堆疊順序

```text
6. 選取與互動層：hover、selection、資訊卡定位
5. 營運資訊層：告警、CCTV、感測器、巡檢車
4. 場域識別層：園區邊界、重要地標、管理範圍
3. 城市建物層：臺北市官方 I3S
2. 地理脈絡層：道路、行政區、水系或正射影像
1. 地球與地形層：globe、terrain、atmosphere
```

上層可以回應互動與營運狀態，下層維持穩定且低干擾。建物本體不應同時承擔所有狀態顏色；被選取的真實建物才增加輪廓、亮度或局部高亮。

### 10.2 相機尺度與資訊密度

| 尺度 | 使用者任務 | 顯示內容 | 隱藏內容 |
| --- | --- | --- | --- |
| 城市 | 理解場域在臺北的位置 | 城市建物量體、行政區或主要地標、場域標記 | 設備點、建物細部標籤 |
| 行政區／街廓 | 比較周邊與進入目標場域 | 道路脈絡、園區邊界、重要建物名稱 | 次要設備與密集文字 |
| 建物 | 查看真實建物屬性與營運摘要 | 選取輪廓、地址、用途、樓層／高度來源 | 無關場域的設備與標籤 |
| 設施 | 處理告警或巡檢 | 已 mapping 的設備、感測器與告警 | 城市級標籤與非必要背景資訊 |

### 10.3 視覺規則

- 底圖使用低飽和、低對比色，避免道路文字與 POI 搶走建物焦點。
- 官方建物預設使用中性藍灰色；不要用紅、黃、綠替整座城市分類。
- 選取建物使用單一品牌強調色與清楚輪廓，取消選取後恢復中性色。
- 告警色只用於確實有營運資料關聯的 marker、輪廓或局部區域。
- 城市尺度不顯示所有 label；依相機高度與重要性逐步出現。
- 正射影像是查核模式，不應成為預設營運畫面。
- 所有公開圖資都需顯示來源；Demo 資料必須清楚標示為模擬。

### 10.4 城市場景完成條件

進入真實建物 mapping 前，至少需符合：

1. 預設畫面能在數秒內看出臺北／南港的空間位置與目標場域。
2. 官方 I3S 與底圖的色彩、亮度及透明度不互相干擾。
3. 城市、街廓、建物三種相機尺度各有明確資訊密度。
4. 圖層開關只包含真實資料來源或明確標示的營運 Demo。
5. 選取官方建物後能穩定取得 feature ID 與可公開欄位。
6. 沒有 API key 浮水印、失效 Provider 或來源不明的 tiles。
7. 行動裝置與一般筆電能維持可操作的相機與圖層切換體驗。

## 11. 效能原則

1. 不在 React render 中建立 Cesium object。
2. 不因圖層開關重建 Viewer。
3. 不因 telemetry 更新重建建物 geometry。
4. 動態點位優先更新既有 Primitive 或 buffer。
5. 大量點位使用 collection，而不是建立數萬個獨立 Entity。
6. 靜態空間運算在資料處理階段預先完成。
7. 選取與查找使用 `Map<externalId, feature>`。
8. 城市級資料使用空間切片與 LOD。
9. 對首次可互動時間、tile 數量、JS heap 與 FPS 建立基準。
10. 所有效能優化都應在量測後進行，不只依檔案大小推測。

## 12. 建議重構順序

### Phase 0：移除誤導性的 Demo 建物（已完成）

- 移除 GIS 場景中的五棟 Cesium Box。
- 移除「3D 建築」圖層開關。
- 移除 Demo 建物的地圖選取、高亮與相機飛行邏輯。
- 保留其他頁面所需的 Demo domain data，避免擴大為不必要的產品重寫。

### Phase A：整理城市視覺與尺度

- [x] 建立 `CityScene`，完全退出 Demo 園區幾何與營運點位。
- [x] 預設使用真實 NLSC 底圖與臺北市官方 I3S。
- [x] 建立南港城市尺度 camera preset。
- [x] 定義城市、街廓與建物尺度的相機高度範圍。
- 調整底圖、globe、fog、I3S 建物與選取狀態的視覺 token。
- 建立標籤密度與營運 overlay 的 visibility policy。
- 完成官方建物選取、來源說明、錯誤與 fallback 體驗。

### Phase B：建立圖層框架

- [x] 建立 `layerCatalog.ts`，並由 UI 直接產生官方圖層控制。
- [x] 建立 `CesiumLayerManager` 與共用 runtime interface。
- 讓 `GisPage` 從 catalog 產生圖層選單。
- 保持 Phase A 已確認的城市視覺結果不變。

### Phase C：拆出既有圖層

- [x] 將臺北市 I3S 移至 `TaipeiOfficialBuildingsLayer`。
- 將園區邊界移至 `CampusBoundaryLayer`。
- 將告警、CCTV、環境站與巡檢車拆成 facility layers。

### Phase D：建立資料 pipeline

- 建立 `data/raw`、`data/processed` 與 `scripts/gis`。
- 建立 schema validation 與 manifest generation。
- 將小型場域範圍與測試 fixture 從 TypeScript 逐步轉為具版本的 GeoJSON。

### Phase E：建立真實建物 mapping

- 定義官方 feature ID、地籍或地址與 SpatialPulse Building 的關聯鍵。
- 保存來源、更新時間與高度計算方式，不以視覺猜測替代資料。
- 只有完成 mapping 的建物才能顯示營運狀態、設備與告警。
- 無法穩定識別的官方建物只提供城市背景與公開屬性查詢。

### Phase F：擴充大量資料能力

- 依 bounding box 提供設備 API。
- 即時資料只訂閱可見園區或建築。
- 評估 Vector Tiles、3D Tiles 與物件儲存。
- 建立圖層效能與錯誤監控。

## 13. 結論

Mini Taiwan 最值得採用的不是特定的 Mapbox 程式碼，而是「原始資料、處理工具、前端資料、載入 hooks、運算引擎與顯示圖層」的責任分離，以及大型資料部署、快取與 LOD 管理方式。

SpatialPulse 應保留 Cesium 與 I3S／3D Tiles 的串流優勢，不把城市級建物轉成巨大 JSON，也不再以模擬方盒代表真實城市建物。近期最重要的成果，是先建立清楚、低干擾且具尺度層級的城市場景；確認官方建物的選取與識別可靠後，再把 I3S、設備與營運圖層拆成獨立 modules，透過統一的 Layer Catalog 與 Layer Manager 管理。
