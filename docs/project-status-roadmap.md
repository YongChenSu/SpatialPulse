# SpatialPulse 專案進度與 GIS 實作 Roadmap

| 項目 | 內容 |
| --- | --- |
| 文件日期 | 2026-10-30 |
| 目前分支 | `feat/smart-campus-gis` |
| 專案定位 | 智慧園區 GIS、3D 建築數位孿生與設施營運平台 |
| 作品目標 | Blog 主力作品集、Web GIS／前端工程職缺展示 |
| 文件狀態 | 開發中，作為後續實作與驗收依據 |

## 1. 產品方向

SpatialPulse 以單一企業內的園區、建築與設備維運為主要情境，不以同一位操作人員跨多間無關公司的監控為核心介面。資料模型仍保留 Tenant 邊界，讓系統未來可以支援多租戶部署。

核心使用流程：

```text
城市／地理環境
    ↓ 選擇園區
園區 GIS 營運總覽
    ↓ 選擇異常建築
建築 3D 數位孿生
    ↓ 選擇樓層與設備
即時數據、告警與維護處理
```

GIS 視覺方向採用以下參考組合：

| 參考 | 採用重點 |
| --- | --- |
| F4map／Cesium OSM Buildings | 真實城市尺度、周邊建築與空間感 |
| Mapbox 3D Buildings | 低干擾底圖、縮放層級與中性建築配色 |
| Autodesk Tandem | 建築、樓層、設備選取後的維運資訊 |
| Spatial Map | 感測器、設備點位與狀態圖層 |

## 2. 目前已完成

### 2.1 建築數位孿生

- React Three Fiber 建築場景。
- 樓層樹、3D 場景與右側營運面板同步。
- 樓層選取、設備標籤與設備狀態視覺化。
- 即時功率、PUE、冷卻用電與環境數據展示。
- 告警確認流程與狀態管理。
- 桌機、平板與手機 RWD。

### 2.2 園區 GIS

- `/gis` CesiumJS 園區營運頁面。
- 園區邊界、建築、告警、CCTV、環境站與巡檢車圖層。
- 建築選取、Camera fly-to、資訊卡與進入數位孿生路由。
- 依建築群 BoundingSphere 自動定位園區。
- Zustand 管理選取建築、底圖與圖層狀態。
- 正常建築使用低干擾青色；警告及嚴重狀態以外框強調。
- 預設只開啟建築及告警，其他設備圖層按需顯示。

### 2.3 GIS 公開圖資

- 已驗證國土測繪中心 NLSC WMTS capabilities。
- 已接入 `EMAP` 臺灣通用電子地圖。
- 已接入 `PHOTO2` 正射影像。
- 介面會標示圖資來源。
- 已區分真實公開底圖與 Demo 模擬建築／IoT 資料。

### 2.4 前後端與測試

- Node.js REST API 提供園區、建築、樓層與 telemetry 資料。
- WebSocket 每三秒推送即時營運數據。
- API 無法使用時可降級至本地展示資料。
- Cesium 與 React Three Fiber 依路由 lazy-load。
- Vitest 單元測試目前 6 項通過。
- Playwright GIS 瀏覽器測試目前 1 項通過。
- ESLint 與 production build 通過。
- 已修正 Cesium Assets／Workers 靜態資源路徑造成的 rendering stopped 錯誤。

## 3. 目前資料真實性

| 資料 | 目前狀態 | 說明 |
| --- | --- | --- |
| NLSC 電子地圖 | 真實公開資料 | 官方 WMTS |
| NLSC 正射影像 | 真實公開資料 | 官方 WMTS |
| 園區範圍 | Demo 模擬資料 | 放置於臺北南港真實座標 |
| 建築位置與長寬高 | Demo 模擬資料 | 目前以 Cesium Box 呈現 |
| 建築名稱與用途 | Demo 模擬資料 | A1、A2、B1、C1、P1 |
| 能耗、健康度與告警 | Demo 模擬資料 | 不代表現場真實營運狀況 |
| CCTV、環境站、巡檢車 | Demo 模擬資料 | 用於展示 GIS 圖層與互動 |

目前不可將建築尺寸或營運值描述成真實南港建築資料。

## 4. 已知問題

### 4.1 CARTO 底圖已不可使用

目前程式中的 CARTO dark tiles 會回傳 `API KEY REQUIRED` 占位圖。該回應可能仍是 HTTP 200，因此既有 Playwright network assertion 無法發現問題。

處理決策：

- 移除 CARTO URL 與 attribution。
- 不再依賴未設定金鑰的第三方底圖作為預設畫面。
- E2E 除了 HTTP status，還要驗證禁止的 provider request 或底圖狀態。

### 4.2 真實底圖會暴露 Demo 建築錯位

目前五棟 Cesium Box 並非依真實建築輪廓建立。電子地圖或正射影像資訊越詳細，模型與真實建物的錯位越明顯。

處理決策：

- 預設營運模式不使用外部 raster imagery。
- 真實地理底圖改成分析模式。
- 在導入官方建築模型前，不宣稱 Box 為真實建築。

### 4.3 舊品牌名稱仍存在

README、`package.json` 與部分介面仍有 `NEXUS FM` 或 `nexus-fm-digital-twin`。後續需統一為 SpatialPulse，但應與 GIS 資料重構分開提交。

## 5. 底圖實作決策

底圖模式定義為：

```ts
type BaseMapId = 'operations' | 'context' | 'orthophoto'
```

### 5.1 Operations／園區營運模式

預設模式，不載入外部圖磚。

- 深藍灰 globe base color。
- 自有園區地面、邊界、內部道路與出入口。
- 只呈現建築、告警及使用者開啟的營運圖層。
- 不依賴 API key，外部服務失效仍可展示。

### 5.2 Context／地理位置模式

- 使用 NLSC `EMAP16`，即無等高線及門牌版本。
- 降低亮度與飽和度。
- 用於確認園區所在位置，不作為主要營運畫面。

### 5.3 Orthophoto／正射影像模式

- 使用 NLSC `PHOTO2`。
- 用於真實環境核對與分析。
- 明確提示建築與 IoT 是否仍為 Demo 模擬資料。

### 5.4 Provider 行為

- 將 provider 設定移出 `CampusMap.tsx`。
- 官方圖資載入失敗時自動回到 `operations`。
- 畫面顯示目前 provider、資料來源與真實性。
- 切換底圖不得重建 Cesium Viewer。

## 6. 臺北市官方三維建物研究

### 6.1 已驗證服務

臺北市三維產權建物 I3S：

```text
https://3d.land.gov.taipei/arcgis/rest/services/Hosted/
CadastralBuilding_2023/SceneServer/layers/0
```

驗證結果：

- 不需要 API key。
- CORS 允許 `http://localhost:5173`。
- 圖層類型為 `3DObject`。
- 坐標系統為 EPSG:4326。
- 垂直基準為 EGM96 Geoid。
- 高度單位為公尺。
- 提供 `View` 與 `Query` capability。
- 涵蓋目前南港示範座標。
- I3S layer version 為 1.9。
- 目前安裝的 Cesium 1.146 可成功建立 `I3SDataProvider` 並解析 metadata。

主要欄位：

- 行政區、建物門牌、建號與棟次。
- 層次、層數、樓地板高與樓層高度。
- 高度來源、面積與總面積。
- 主要用途、主要建材、使用執照與建築完成日期。

### 6.2 高度解讀限制

此服務是三維產權模型，不是一棟建築一筆資料。主要建物、各樓層、地下室、陽台、平台、騎樓等可能是不同 feature。

- `高度` 的 alias 是「樓地板高」，不是整棟高度。
- `樓層高度` 是單一樓層高度。
- 不能直接把某個 feature 的 `高度` 顯示成整棟樓高。
- 整棟高度需先正確分組，再以最高頂部高程減最低底部高程計算。
- 初步分組候選為 `建物門牌 + 棟次`，實作前必須抽樣驗證。

暫定計算方式：

```text
featureTop = 樓地板高 + 樓層高度
buildingHeight = max(featureTop) - min(樓地板高)
```

### 6.3 其他官方 I3S

臺北市都發局文件另列出：

- 2025 全市 LOD1 白模。
- 南港軟體園區 Mesh。
- 歷年 LOD1 與仿真模型。

這些模型在視覺上比產權模型更適合作為城市背景，但在 2026-10-30 實測時 endpoint 回傳「此服務無法使用」，不可作為目前唯一依賴。

### 6.4 使用與隱私原則

- 公開作品只顯示維運必要欄位。
- 不顯示建號、地號、收件年字號等不必要資料。
- 標示資料來源為臺北市政府。
- 不快取或重新散布完整官方模型。
- 若轉為商業使用，先聯絡資料管理單位取得同意。

## 7. 外部 Repo 評估

`ianlkl11234s/gis-data-collectors` 不包含建築輪廓、建築高度、LiDAR 或三維建物 collector。它主要收集交通、航空、航運、氣象、災害、環境、水利與 POI 資料，且授權標示為 `Internal use only`。

結論：

- 不作為 SpatialPulse 建築高度來源。
- 不直接複製其程式。
- 未來可將其中提及的官方即時資料來源作為研究線索，但需自行依來源授權介接。

## 8. 接下來的實作順序

### Phase 1：底圖重構

- [ ] 將 `BaseMapId` 改為 `operations | context | orthophoto`。
- [ ] 刪除 CARTO provider。
- [ ] 建立獨立 basemap provider 設定模組。
- [ ] `operations` 不建立 ImageryLayer。
- [ ] `context` 改用 NLSC `EMAP16`。
- [ ] `orthophoto` 保留 NLSC `PHOTO2`。
- [ ] 加入 provider error fallback。
- [ ] 更新底圖選單、來源標示與測試。

驗收條件：

- 首頁不出現 API key、watermark 或錯誤圖磚。
- 沒有外部 imagery 時仍可完整操作園區。
- NLSC 無法使用時不造成 Cesium render loop 停止。

### Phase 2：臺北市 I3S POC

- [ ] 建立 `TaipeiBuildingsLayer` 或對應 hook／service。
- [ ] 使用 `I3SDataProvider.fromUrl()` 載入官方 layer 0。
- [ ] 設定 `showFeatures: true` 以支援 feature picking。
- [ ] 關閉官方多色 symbology，改成低干擾青灰材質。
- [ ] 限制 initial camera 在南港，觀察可見範圍串流效能。
- [ ] 驗證完整瀏覽器渲染，而不只 metadata parsing。
- [ ] 驗證點擊 feature 可取得安全欄位。
- [ ] 檢查 EGM96 與 Cesium ellipsoid 高度偏移。
- [ ] 建立 loading、timeout、error 與 retry UI。

驗收條件：

- 南港範圍可穩定顯示官方模型。
- 點擊建築可取得樓層、高度來源、用途及建材。
- 地圖操作期間無 console error、Cesium error panel 或明顯記憶體問題。

### Phase 3：以官方模型取代 Demo Box

- [ ] 抽樣驗證 `建物門牌 + 棟次` 分組規則。
- [ ] 定義官方 feature 與 SpatialPulse Building 的 mapping。
- [ ] 計算並保存可追溯的 building height。
- [ ] 建立 `heightSource` 與 `heightQuality` 欄位。
- [ ] 只將少數目標建築綁定模擬營運資料。
- [ ] 周邊官方建築維持中性色。
- [ ] 只有選取、警告與嚴重異常建築使用狀態強調。
- [ ] 驗證完成後移除或降級目前 Cesium Box。

建議資料結構：

```ts
interface BuildingGeometryMetadata {
  externalId: string
  height: number | null
  heightSource: 'taipei-i3s' | 'official-shp' | 'osm' | 'estimated'
  heightQuality: 'official' | 'derived' | 'estimated' | 'unknown'
  observedAt?: string
}
```

### Phase 4：GIS 使用者體驗

- [ ] 城市尺度只顯示園區名稱與主要場域。
- [ ] 園區尺度顯示建築名稱、狀態與重大告警數。
- [ ] 靠近或選取建築後才顯示 CCTV、環境站與設備。
- [ ] 建築選取後顯示官方屬性與模擬營運資料的來源差異。
- [ ] 建立 hover、selected、warning、critical 四種視覺狀態。
- [ ] 讓狀態色集中在輪廓、光暈或標記，避免整座城市過度著色。

### Phase 5：品牌與文件整理

- [ ] 將 README 標題改為 SpatialPulse。
- [ ] 更新 `package.json` package name。
- [ ] 清理 NEXUS FM 舊名稱。
- [ ] 補上資料來源、授權與隱私說明。
- [ ] 撰寫 Blog 架構文章與 GIS 資料可信度章節。

## 9. 測試計畫

### Unit

- 底圖模式與 fallback 狀態。
- 圖層開關互不影響。
- 建築選取與回到園區。
- 高度分組與衍生計算。
- 真實、衍生與模擬資料標記。

### E2E

- 預設 Operations 模式不請求 CARTO。
- NLSC context 與 orthophoto 可以切換。
- provider 失敗時回到 Operations。
- I3S 載入成功且無 Cesium error panel。
- 點擊官方 feature 顯示建築摘要。
- 不在公開 UI 顯示禁止欄位。

### Performance

- 記錄 I3S 首次可互動時間。
- 記錄 visible tile 數量與記憶體使用。
- 驗證相機移動時不重建 provider。
- 檢查低階裝置與窄螢幕降級策略。

## 10. 近期完成定義

下一個可交付里程碑定義為：

```text
沒有 API key 錯誤的 Operations 底圖
    +
可切換的 NLSC 地理／正射影像
    +
南港範圍臺北市官方 I3S 建築 POC
    +
可點選並顯示安全的官方建築欄位
    +
清楚標示官方幾何與模擬營運資料
```

達成以上條件後，才開始以官方建築取代現有 Demo Box，避免在資料分組與高度定義尚未驗證前過早重寫主場景。
