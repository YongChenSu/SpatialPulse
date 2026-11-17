# 智慧園區 GIS × 3D 設施管理平台規格書

| 項目 | 內容 |
| --- | --- |
| 專案名稱 | NEXUS FM 智慧園區設施管理平台 |
| 文件版本 | 1.0 |
| 文件狀態 | 開發規劃 |
| 目標形式 | Blog 主力作品集、求職 Demo |
| 主要技術 | React、TypeScript、CesiumJS、React Three Fiber、Node.js、PostgreSQL、PostGIS、WebSocket |

## 1. 專案摘要

本專案是一套結合 Web GIS、3D 建築數位孿生、IoT 即時數據、能源環境分析、告警與維護工單的智慧園區設施管理平台。

系統使用 CesiumJS 呈現城市、園區及建築尺度的地理資訊，使用 React Three Fiber 呈現單棟建築內部的樓層、空間與設備。使用者能從園區 GIS 發現異常建築，進入建築數位孿生定位設備，查看即時與歷史數據，並建立維護工單完成事件處理。

核心操作流程如下：

```text
智慧園區 GIS
    ↓ 選擇建築
建築 3D 數位孿生
    ↓ 選擇樓層與設備
即時數據與歷史趨勢
    ↓ 發現異常
告警確認與維護工單
    ↓
處理、恢復與關閉
```

## 2. 專案目標

### 2.1 產品目標

- 整合園區、建築、樓層、空間、設備與感測點的階層資料。
- 在 GIS 中呈現建築分布、營運狀態、環境數據與告警熱點。
- 在 3D 建築場景中呈現樓層、設備位置及即時狀態。
- 建立從告警發生、空間定位、設備診斷到維修結案的完整流程。
- 提供能源、環境與設備健康度的即時及歷史分析。
- 建立可擴展的前後端架構，支援未來增加不同案場與建築模型。

### 2.2 作品集目標

- 展示 React、TypeScript、SCSS、RWD 與前端模組化能力。
- 展示 CesiumJS、GeoJSON、3D Tiles 與 Web GIS 整合能力。
- 展示 Three.js／React Three Fiber 的 3D 場景及設備互動能力。
- 展示 Node.js、REST API、WebSocket、SQL 與 PostGIS 能力。
- 展示即時資料、狀態同步、錯誤處理、效能與測試能力。
- 產出可拆分為多篇技術文章的實際問題與解決方案。

### 2.3 非目標

第一階段不包含以下內容：

- 完整商業 SaaS 計費與訂閱方案。
- 同一畫面比較多間互不相關公司的營運績效。
- 真實控制現場機電設備。
- 完整 BIM 編輯器或 CAD 建模工具。
- 第一階段即建立大量微服務。
- 第一階段即支援所有 GIS 格式與 IoT 通訊協定。

## 3. 使用者與角色

### 3.1 主要使用者

| 使用者 | 主要需求 |
| --- | --- |
| 園區設施主管 | 查看整體營運、能源、告警及維護成效 |
| 機電維運人員 | 定位異常設備、查看數據、處理工單 |
| 數據中心管理者 | 查看 PUE、IT 負載、冷卻與設備可用率 |
| 能源管理人員 | 查看能源趨勢、尖峰、比較與改善成效 |
| 監控中心人員 | 查看即時事件、CCTV、告警與設備狀態 |
| 系統管理員 | 管理使用者、角色、案場、設備與規則 |

### 3.2 權限角色

| 角色 | 權限範圍 |
| --- | --- |
| Tenant Admin | 管理公司、使用者、案場與系統設定 |
| Site Manager | 管理被授權的園區及建築 |
| Operator | 查看設備、確認告警、建立與更新工單 |
| Technician | 查看被指派工單及更新處理進度 |
| Viewer | 唯讀查看 GIS、3D 場景與報表 |

資料模型保留 `tenantId` 作為隔離邊界，但一般使用者登入後以單一公司內的園區與建築操作為主，不將跨公司監控作為主要介面。

## 4. 資產資訊架構

```text
Tenant／公司
└── Site／園區或案場
    └── Building／建築
        └── Floor／樓層
            └── Space／空間
                └── Asset／設備
                    └── Point／感測點
```

### 4.1 層級定義

| 層級 | 說明 | 範例 |
| --- | --- | --- |
| Tenant | 資料與權限隔離單位 | 富利銀行 |
| Site | 具有地理範圍的園區或案場 | 台北南港園區 |
| Building | 園區內的建築 | A1 數據中心 |
| Floor | 建築樓層 | 3F |
| Space | 樓層內的功能空間 | 主機房 B |
| Asset | 可管理的設備 | CRAC-03 |
| Point | 設備的量測或控制點 | 回風溫度 |

## 5. 系統資訊架構

```text
智慧園區平台
├── GIS 營運總覽
├── 建築 3D 數位孿生
├── 環境與能源分析
├── 告警中心
├── 維護工單
└── 系統管理
```

### 5.1 建議路由

```text
/gis
/sites/:siteId
/sites/:siteId/energy
/buildings/:buildingId/twin
/buildings/:buildingId/floors/:floorId
/assets/:assetId
/alerts
/work-orders
/settings/users
/settings/assets
/settings/rules
```

## 6. 系統架構

```text
                         React Web Application
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Cesium GIS          R3F Digital Twin        Dashboard      │
│  城市／園區／建築      樓層／空間／設備          圖表／管理      │
│       │                      │                    │         │
│       └──────────────┬───────┴────────────────────┘         │
│                      ▼                                     │
│       React Router + TanStack Query + Zustand              │
│                      │                                     │
└──────────────────────┼─────────────────────────────────────┘
                       │ REST / WebSocket
                       ▼
┌────────────────────────────────────────────────────────────┐
│                  Node.js Modular Backend                   │
│                                                            │
│  Auth  GIS  Site  Asset  Telemetry  Alert  Work Order      │
│                                                            │
└─────────────────┬──────────────────────┬───────────────────┘
                  │                      │
                  ▼                      ▼
       PostgreSQL + PostGIS       Telemetry Storage
       空間資料與業務資料           即時與歷史數據
```

### 6.1 3D 技術分工

| 顯示尺度 | 技術 | 責任 |
| --- | --- | --- |
| 城市、機場、園區 | CesiumJS | 地形、地理座標、園區範圍、建築分布、移動資產 |
| 單棟建築內部 | React Three Fiber | 樓層隔離、室內空間、設備、感測器與機櫃 |
| 管理介面 | React | KPI、圖表、列表、告警、工單與設定 |

CesiumJS 與 React Three Fiber 不共用同一個 Canvas。兩者透過路由及共用的 Site、Building、Asset 資料模型串接。

## 7. 功能需求

### 7.1 GIS 營運總覽

#### FR-GIS-01 園區與建築顯示

- 使用 CesiumJS 顯示指定園區。
- 顯示園區邊界 Polygon。
- 顯示園區內建築位置及名稱。
- 支援 Cesium Camera fly-to。
- 建築狀態以顏色區分正常、警告、嚴重與離線。
- 點擊建築後顯示建築摘要卡片。

#### FR-GIS-02 GIS 圖層管理

系統應提供以下可切換圖層：

- 3D 建築
- 告警熱點
- CCTV
- 環境感測站
- 能源設備
- 維護工單
- 移動車輛與軌跡

切換圖層時只更新相關 Cesium Entity 或 DataSource，不重新建立整個 Viewer。

#### FR-GIS-03 建築資訊卡

資訊卡至少顯示：

- 建築名稱
- 健康評分
- 即時功率
- 今日能源
- 設備在線率
- 未處理告警數量
- 進入 3D 建築按鈕
- 查看能源分析按鈕

#### FR-GIS-04 告警熱點

- GIS 上顯示建築及戶外設備告警。
- 標記依告警嚴重程度使用不同顏色。
- 點擊告警後定位至發生位置。
- 建築內設備告警應提供進入建築數位孿生的入口。

#### FR-GIS-05 移動資產

- 顯示接駁車、維修車或保全巡邏車即時位置。
- 透過 WebSocket 更新經緯度、方向與狀態。
- 顯示最近一段時間的移動軌跡。
- 支援進入或離開指定地理圍籬的事件提示。

#### FR-GIS-06 可視範圍查詢

- GIS 移動至新範圍時，以 bounding box 查詢可見設備。
- API 不應一次回傳全部園區設備。
- 大量標記應支援 clustering 或依 zoom level 控制細節。

### 7.2 建築 3D 數位孿生

#### FR-TWIN-01 建築模型

- 支援載入 GLB／glTF 建築模型。
- 保留未來載入 IFC 或轉換後模型的介面。
- 顯示 loading、載入失敗及重試狀態。
- 模型與設備營運資料應分離。

#### FR-TWIN-02 樓層導覽

- 使用者可從資產樹或 3D 樓層列選擇樓層。
- 選擇樓層後相機移動至目標位置。
- 非選取樓層降低透明度或隱藏。
- 右側數據與告警同步切換至該樓層。
- 選擇狀態應同步至 URL。

#### FR-TWIN-03 設備圖層

支援以下設備分類：

- 環境感測器
- 空調系統
- 消防設備
- 電力設備
- CCTV
- 門禁設備
- 機櫃與 IT 設備

每一圖層應控制 3D 標記、設備統計、告警列表及面板內容。

#### FR-TWIN-04 設備標記

- 標記顯示設備類型與即時狀態。
- Hover 顯示設備摘要。
- Click 選取設備並開啟詳細面板。
- 告警設備顯示脈衝或其他不依賴顏色的提示。
- 大量標記時採用距離過濾、聚合或 InstancedMesh。

#### FR-TWIN-05 設備詳細資料

設備面板至少顯示：

- 名稱與編號
- 建築、樓層與空間
- 設備類型
- 運作狀態
- 即時感測數據
- 最近更新時間
- 最近保養時間
- 24 小時歷史趨勢
- 相關告警
- 查看歷史與建立工單操作

#### FR-TWIN-06 CCTV

- CCTV 設備顯示在線狀態。
- 點擊後顯示模擬或授權影像預覽。
- 顯示影像時間、位置及最近事件。
- 無法載入影像時顯示明確錯誤狀態。

### 7.3 環境與能源

#### FR-ENV-01 環境指標

系統至少顯示：

- 溫度
- 濕度
- CO₂
- PM2.5
- 室內外差值
- 當日最高與最低值
- 24 小時趨勢

#### FR-ENERGY-01 能源指標

系統至少顯示：

- 即時功率
- 今日用電
- 冷卻用電
- IT 負載
- PUE
- 容量使用率
- 再生能源占比
- 今日尖峰功率

#### FR-ENERGY-02 分析能力

- 支援日、週、月時間範圍。
- 支援園區、建築及樓層層級。
- 顯示實際值與目標值。
- 顯示與前一期間比較。
- 提供用電分類及能源流向圖。

### 7.4 告警中心

#### FR-ALERT-01 告警生命週期

```text
OPEN
→ ACKNOWLEDGED
→ IN_PROGRESS
→ RESOLVED
→ CLOSED
```

- 告警不可因確認而直接刪除。
- 記錄每一次狀態變更、操作者、時間及備註。
- 已恢復數值但尚未完成處理的告警不得自動關閉。

#### FR-ALERT-02 告警資訊

告警至少包含：

- 告警編號
- 嚴重程度
- 發生位置
- 關聯設備與感測點
- 觸發值與門檻
- 發生時間與持續時間
- 目前負責人
- 目前狀態
- 相關工單

#### FR-ALERT-03 告警與 3D 聯動

點擊建築內告警時，系統應：

1. 進入對應建築 3D 頁面。
2. 切換至告警設備所在樓層。
3. 將相機移動到設備附近。
4. 突出異常設備並淡化其他設備。
5. 開啟設備與告警詳細資料。

#### FR-ALERT-04 告警規則

- 規則可套用至案場、設備類型、設備或感測點。
- 支援大於、小於、等於、離線及持續時間條件。
- 規則包含嚴重程度與啟用狀態。
- 不同案場可設定不同門檻。

### 7.5 維護工單

#### FR-WO-01 建立工單

- 可從告警或設備建立工單。
- 工單可關聯建築、樓層、空間、設備與告警。
- 支援標題、說明、優先級、負責人與到期日。

#### FR-WO-02 工單狀態

```text
DRAFT → OPEN → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED
```

- 所有狀態變更保留操作紀錄。
- 完成工單時需填寫處理結果。
- 工單關閉不應自動刪除關聯告警歷史。

#### FR-WO-03 維修歷史

- 設備詳細頁顯示歷史工單。
- 支援依狀態、負責人、設備、日期篩選。
- 顯示平均處理時間與逾期狀態。

### 7.6 系統管理

- 使用者與角色管理。
- 園區、建築、樓層與空間管理。
- 設備類型、設備及感測點管理。
- 告警規則管理。
- 3D 模型與設備節點綁定。
- GIS 圖層設定。

## 8. 核心使用者流程

### 8.1 告警處理流程

```text
1. 使用者進入智慧園區 GIS。
2. GIS 顯示各建築即時健康狀態。
3. A1 數據中心因 CRAC-03 高溫轉為紅色。
4. 使用者點擊告警，Cesium 相機移至 A1。
5. 建築資訊卡顯示未處理告警及即時功率。
6. 使用者點擊「進入數位孿生」。
7. 系統載入 A1 建築並自動選擇 3F。
8. 相機定位 CRAC-03，開啟設備面板。
9. 使用者查看回風溫度及 24 小時趨勢。
10. 使用者確認告警並建立維護工單。
11. 工單指派給工程師並進入處理中。
12. 數值恢復，工程師填寫處理結果。
13. 主管關閉工單與告警。
```

### 8.2 建築巡檢流程

```text
1. 從 GIS 選擇建築。
2. 進入建築 3D 場景。
3. 依序切換樓層及設備圖層。
4. 查看設備在線率與環境異常。
5. 選擇設備查看歷史數據。
6. 必要時建立預防性維護工單。
```

## 9. 資料模型

### 9.1 空間與資產模型

```ts
interface Tenant {
  id: string
  name: string
}

interface Site {
  id: string
  tenantId: string
  name: string
  center: GeographicPosition
  boundary: GeoJSON.Polygon
}

interface Building {
  id: string
  tenantId: string
  siteId: string
  name: string
  location: GeographicPosition
  heading: number
  modelUrl?: string
  healthScore: number
  status: AssetStatus
}

interface Floor {
  id: string
  tenantId: string
  buildingId: string
  name: string
  level: number
}

interface Space {
  id: string
  tenantId: string
  floorId: string
  name: string
  type: string
}

interface Asset {
  id: string
  tenantId: string
  siteId: string
  buildingId?: string
  floorId?: string
  spaceId?: string
  assetTypeId: string
  name: string
  status: AssetStatus
}

interface Point {
  id: string
  tenantId: string
  assetId: string
  metric: string
  unit?: string
  dataType: 'number' | 'boolean' | 'string'
}
```

### 9.2 空間綁定

```ts
interface GeographicPosition {
  longitude: number
  latitude: number
  height: number
}

interface LocalPosition {
  x: number
  y: number
  z: number
}

interface SpatialBinding {
  assetId: string
  geographicPosition?: GeographicPosition
  localPosition?: LocalPosition
  modelId?: string
  modelNodeId?: string
}
```

### 9.3 即時數據

```ts
interface TelemetryEvent {
  tenantId: string
  siteId: string
  assetId: string
  pointId: string
  metric: string
  value: number | string | boolean
  unit?: string
  quality: 'good' | 'uncertain' | 'bad'
  timestamp: string
}
```

### 9.4 告警規則

```ts
interface AlertRule {
  id: string
  tenantId: string
  name: string
  scopeType: 'site' | 'asset-type' | 'asset' | 'point'
  scopeId: string
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'offline'
  threshold?: number
  durationSeconds: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
}
```

## 10. API 規格

### 10.1 REST Endpoint

| Method | Endpoint | 說明 |
| --- | --- | --- |
| GET | `/api/sites` | 取得使用者可查看的案場 |
| GET | `/api/sites/:siteId` | 取得案場資訊 |
| GET | `/api/sites/:siteId/buildings` | 取得案場建築 |
| GET | `/api/sites/:siteId/layers` | 取得 GIS 圖層設定 |
| GET | `/api/assets?bbox=...` | 取得可視範圍內設備 |
| GET | `/api/buildings/:buildingId` | 取得建築摘要 |
| GET | `/api/buildings/:buildingId/floors` | 取得樓層 |
| GET | `/api/floors/:floorId/assets` | 取得樓層設備 |
| GET | `/api/assets/:assetId` | 取得設備詳細資料 |
| GET | `/api/assets/:assetId/telemetry` | 取得設備歷史數據 |
| GET | `/api/alerts` | 查詢告警 |
| PATCH | `/api/alerts/:alertId/status` | 更新告警狀態 |
| GET | `/api/work-orders` | 查詢工單 |
| POST | `/api/work-orders` | 建立工單 |
| PATCH | `/api/work-orders/:workOrderId` | 更新工單 |

### 10.2 Bounding Box 查詢

```text
GET /api/assets
    ?siteId=site-taipei-a1
    &bbox=121.50,25.02,121.62,25.10
    &types=cctv,environment
```

後端必須驗證使用者是否擁有 `siteId` 的存取權，不可只相信前端傳入的 `tenantId`。

### 10.3 WebSocket 頻道

```text
site:{siteId}
building:{buildingId}
asset:{assetId}
```

訂閱訊息：

```json
{
  "type": "subscribe",
  "scope": {
    "siteId": "site-taipei-a1"
  }
}
```

事件類型：

```text
telemetry.updated
asset.status.changed
alert.created
alert.updated
vehicle.position.updated
work-order.updated
```

伺服器在加入頻道前必須驗證使用者權限，不得將所有事件廣播給所有連線。

## 11. 前端狀態管理

### 11.1 URL 狀態

以下狀態應存在 URL：

- `siteId`
- `buildingId`
- `floorId`
- 頁面類型
- 可分享的篩選條件

### 11.2 Server State

TanStack Query 管理：

- Site、Building、Floor、Asset
- 告警與工單
- 能源與環境歷史資料
- API loading、error、cache 與重新取得

Query Key 必須包含資料範圍：

```ts
['buildings', siteId]
['assets', siteId, bounds, filters]
['alerts', siteId, buildingId, filters]
['telemetry', assetId, dateRange]
```

### 11.3 UI State

Zustand 管理：

- 選取建築、樓層與設備
- 啟用的 GIS／設備圖層
- 3D 顯示模式
- 面板開關
- 相機操作模式

## 12. 後端模組

```text
server/
├── modules/
│   ├── auth/
│   ├── tenants/
│   ├── sites/
│   ├── gis/
│   ├── assets/
│   ├── telemetry/
│   ├── alerts/
│   ├── work-orders/
│   └── digital-twins/
├── realtime/
├── database/
└── app.ts
```

第一階段採模組化單體，不預先拆分微服務。當 Telemetry Ingestion 需要獨立擴展時，再拆分資料平面。

## 13. 資料庫

### 13.1 技術選擇

- PostgreSQL：使用者、案場、資產、告警與工單。
- PostGIS：園區範圍、建築位置、設備位置與空間查詢。
- 初期可使用 PostgreSQL 儲存低頻歷史數據。
- 大量時間序列需求出現後，再評估 TimescaleDB 或 InfluxDB。

### 13.2 索引原則

- 主要業務表包含 `tenant_id`。
- 常用索引以 `tenant_id` 或 `site_id` 開頭。
- 地理位置建立 GiST 空間索引。
- Telemetry 依設備、感測點與時間建立複合索引。

```sql
CREATE INDEX idx_assets_tenant_site
ON assets (tenant_id, site_id);

CREATE INDEX idx_alerts_site_status_created
ON alerts (site_id, status, created_at DESC);

CREATE INDEX idx_assets_location
ON assets USING GIST (location);
```

## 14. 非功能需求

### 14.1 效能

- 初始頁面應提供 skeleton 或 loading feedback。
- 3D 模型採用 lazy loading。
- 路由層級進行 code splitting，Cesium 與 Three.js 不進入不需要的頁面 bundle。
- 地圖設備依可視範圍查詢。
- WebSocket 高頻數據應節流或批次更新。
- 大量 3D 設備使用 InstancedMesh 或同等策略。
- 圖表資料依顯示時間範圍進行降採樣。

### 14.2 可用性

- API 或 WebSocket 失敗時顯示明確狀態。
- WebSocket 支援指數退避重連。
- 斷線期間顯示最後更新時間，避免讓使用者誤認為是即時資料。
- Demo 後端不可用時可切換模擬資料模式。

### 14.3 安全

- 所有 API 由後端驗證使用者與資料範圍。
- WebSocket 訂閱前驗證權限。
- 不將敏感 CCTV URL 暴露為永久公開網址。
- 關鍵操作保留 Audit Log。
- 不在前端環境變數存放伺服器密鑰。

### 14.4 無障礙

- 告警狀態不可只依賴顏色。
- 所有按鈕提供可理解的 accessible name。
- 鍵盤可操作主要列表、篩選與告警流程。
- 尊重 `prefers-reduced-motion`。
- Canvas 外提供設備和告警的文字替代列表。

### 14.5 RWD

| 尺寸 | 介面行為 |
| --- | --- |
| 桌機／大螢幕 | GIS 或 3D 為主畫面，左右資訊面板同時顯示 |
| 平板 | 次要面板改為 Drawer 或下方卡片 |
| 手機 | 以列表與摘要為主，3D 提供簡化操作 |

## 15. 視覺設計方向

系統提供兩種顯示模式：

### 15.1 日常管理模式

- 淺色介面。
- 適合桌面工作與長時間閱讀。
- 以清楚的表格、卡片與操作流程為主。

### 15.2 指揮中心模式

- 深色背景與青藍高亮。
- GIS 或 3D 佔據主要畫面。
- 使用半透明資訊面板。
- 適合大螢幕與監控中心展示。

### 15.3 狀態與設備 Token

```scss
--status-normal;
--status-warning;
--status-critical;
--status-offline;

--device-cctv;
--device-hvac;
--device-fire;
--device-power;
--device-access;
--device-environment;
```

## 16. 測試需求

### 16.1 單元測試

- 資產階層轉換。
- 告警狀態機。
- 工單狀態機。
- Telemetry 格式標準化。
- WebSocket 事件處理。
- GIS 樣式與狀態映射。

### 16.2 元件測試

- 園區與建築篩選。
- 點擊告警後狀態同步。
- 設備圖層切換。
- 告警確認及建立工單。
- API error、empty 及 loading 狀態。

### 16.3 整合測試

- REST API 權限範圍。
- Bounding box 空間查詢。
- 告警到工單完整流程。
- WebSocket 訂閱授權。
- 不同案場資料不得互相洩漏。

### 16.4 E2E 測試

主要 E2E 情境：

```text
GIS 發現告警
→ 進入建築
→ 定位樓層與設備
→ 查看歷史數據
→ 確認告警
→ 建立與完成工單
```

## 17. 開發里程碑

### M1：3D 設施管理 Demo（已完成基礎）

- React、TypeScript、SCSS 與 RWD。
- React Three Fiber 程式化數據中心。
- 資產樹、樓層選取與 3D 場景同步。
- KPI、用電趨勢、樓層環境與告警。
- Node REST API 與 WebSocket。
- Zustand 與 Vitest 核心測試。

### M2：GIS 基礎與產品串接

- React Router。
- Cesium GIS 頁面。
- Site、Building 與 GIS 圖層模型。
- 園區 Polygon、建築標記與狀態。
- 建築資訊卡。
- 從 GIS 進入現有 3D 數位孿生。
- Cesium 頁面 lazy loading。

### M3：空間後端與資料庫

- Node 模組化後端。
- PostgreSQL + PostGIS。
- Site、Building、Asset 資料表。
- GeoJSON 與 bounding box API。
- TanStack Query。
- 資產 CRUD 與 API integration tests。

### M4：精緻 3D 與即時 GIS

- GLB 建築模型。
- 設備與模型節點綁定。
- 3D 相機定位動畫。
- WebSocket 車輛位置。
- 告警熱點與建築狀態更新。
- Marker clustering 或可視範圍最佳化。

### M5：告警與維運閉環

- 告警規則與完整生命週期。
- 維護工單 CRUD。
- 指派、備註與操作紀錄。
- GIS 告警到 3D 設備定位。
- 環境與能源報表。
- 角色與權限。

### M6：效能、PWA 與技術文章

- 3D Tiles 或大量 GIS 物件。
- 大量 Entity、InstancedMesh 效能測試。
- WebSocket 節流與斷線補資料。
- PWA 與最後資料離線檢視。
- Lighthouse、bundle 及渲染效能報告。

## 18. 各階段驗收條件

### 18.1 GIS 基礎驗收

- 可正常載入 Cesium 且元件卸載後不殘留 Viewer。
- 可顯示園區邊界及至少五棟建築。
- 點擊建築可開啟對應資訊卡。
- 建築狀態可由 API 或 WebSocket 更新。
- 可從建築資訊卡進入正確的 3D 建築頁面。

### 18.2 3D 建築驗收

- 可旋轉、縮放及重設視角。
- 樓層樹與 3D 場景保持同步。
- 可依類型顯示或隱藏設備。
- 點擊設備可顯示詳細數據。
- 點擊告警可自動定位對應設備。

### 18.3 告警工單驗收

- 告警狀態必須遵守允許的狀態轉換。
- 每次操作記錄操作者與時間。
- 可從告警建立工單。
- 工單完成後仍保留告警及維修歷史。

### 18.4 非功能驗收

- Production build 與自動化測試通過。
- API 錯誤不造成整頁崩潰。
- WebSocket 斷線時明確顯示非即時狀態。
- 桌機、平板與手機均可完成主要操作。
- Cesium 和 Three.js 使用路由切分，避免同時載入。

## 19. JD 能力對照

| 能力 | 專案對應 |
| --- | --- |
| React、JavaScript、ES6 | React + TypeScript 應用程式 |
| HTML5、CSS3、SASS | 語意結構、SCSS token、RWD |
| 可重用與可擴展模組 | GIS 圖層、設備標記、圖表、資產樹與面板 |
| Node.js 與 API | REST API、WebSocket、模組化後端 |
| SQL 與資料庫 | PostgreSQL、資料模型與索引 |
| Web GIS | CesiumJS、GeoJSON、空間查詢與 PostGIS |
| 3D GIS | glTF、3D Tiles、建築狀態視覺化 |
| WebGL 與 3D | React Three Fiber 建築數位孿生 |
| 即時資料 | WebSocket、訂閱頻道、節流與重連 |
| 前端測試 | Vitest、Testing Library、E2E |
| PWA | 離線顯示最後資料與可安裝體驗 |

## 20. Blog 文章規劃

1. 從 Cesium 園區進入 Three.js 建築：兩種 3D 引擎如何分工
2. GeoJSON、PostGIS 與 bounding box：避免 GIS 一次載入所有設備
3. GIS 告警如何一路定位到室內 3D 設備
4. GLTF 節點與 IoT Asset ID 的綁定設計
5. Cesium Viewer 在 React 中的生命週期與資源清理
6. 上千個 GIS Marker 的 clustering 與效能比較
7. 上千個 3D 設備的 InstancedMesh 與 FPS 量測
8. WebSocket 訂閱頻道：從全域廣播改成案場分流
9. 告警不是一個 boolean：維運系統的狀態機設計
10. 智慧建築儀表板的 SCSS token、深色模式與 RWD

## 21. 開發原則

- 優先完成可以操作的端到端流程，再增加資料量與技術複雜度。
- GIS、3D 與管理 UI 共用業務資料，不互相依賴渲染實作。
- 即時傳輸集中於 adapter，畫面元件不直接管理 WebSocket。
- API 資料由 TanStack Query 管理，Zustand 專注 UI 與 3D 互動。
- 所有新增功能必須包含 loading、empty、error 及權限不足狀態。
- 以模組化單體作為後端起點，有獨立擴展需求後再拆服務。
- 每個里程碑皆需更新 README、架構圖、操作 GIF 與測試結果。

