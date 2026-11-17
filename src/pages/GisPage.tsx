import {
  Building2, Database, Info, Layers3, LocateFixed, Map, MapPin,
  MousePointer2, Satellite,
} from 'lucide-react'
import { Header } from '../components/Header'
import { NavRail } from '../components/NavRail'
import { baseMapMetadata } from '../features/gis/catalog/basemaps'
import { cityLayerCatalog } from '../features/gis/catalog/layerCatalog'
import { CityScene } from '../features/gis/scene/CityScene'
import { useCitySceneStore } from '../features/gis/store/useCitySceneStore'

export function GisPage() {
  const layers = useCitySceneStore((state) => state.layers)
  const toggleLayer = useCitySceneStore((state) => state.toggleLayer)
  const baseMap = useCitySceneStore((state) => state.baseMap)
  const setBaseMap = useCitySceneStore((state) => state.setBaseMap)
  const baseMapError = useCitySceneStore((state) => state.baseMapError)
  const officialBuildingsStatus = useCitySceneStore((state) => state.officialBuildingsStatus)
  const officialBuildingsError = useCitySceneStore((state) => state.officialBuildingsError)
  const retryOfficialBuildings = useCitySceneStore((state) => state.retryOfficialBuildings)
  const selectedOfficial = useCitySceneStore((state) => state.selectedOfficialBuilding)
  const selectOfficialBuilding = useCitySceneStore((state) => state.setSelectedOfficialBuilding)
  const focusArea = useCitySceneStore((state) => state.focusArea)
  const cameraScale = useCitySceneStore((state) => state.cameraScale)

  return (
    <div className="app-shell gis-shell">
      <Header />
      <NavRail />
      <main className="gis-main">
        <section className="gis-viewport">
          <CityScene />

          <header className="gis-commandbar glass-panel">
            <div>
              <small>TAIPEI 3D CITY SCENE</small>
              <h1>臺北市三維建物場景</h1>
              <span><MapPin size={11} />南港區 · 官方公開圖資</span>
            </div>
            <div className={`gis-commandbar__status ${officialBuildingsStatus}`}>
              <span><i />{formatLayerStatus(officialBuildingsStatus)}</span>
              <b>{formatCameraScale(cameraScale)} · TAIPEI CITY I3S</b>
            </div>
            <button aria-label="定位南港" onClick={focusArea}><LocateFixed size={17} />定位南港</button>
          </header>

          <aside className="gis-left-panel glass-panel">
            <div className="gis-panel-heading">
              <div><small>CITY LAYERS</small><h2>城市圖層</h2></div>
              <Layers3 size={18} />
            </div>
            <div className="site-overview city-dataset-overview">
              <div className="site-overview__icon"><Building2 size={20} /></div>
              <div><b>臺北市雙層建物場景</b><span>NLSC 2025 城市背景 + 2025 產權模型</span></div>
              <em>REAL</em>
            </div>
            <div className="layer-section city-layer-section">
              <div className="subheading"><b>建物與內容</b><span>{Object.values(layers).filter(Boolean).length}/{cityLayerCatalog.length}</span></div>
              {cityLayerCatalog.map(({ id, label, icon: Icon, badge }) => (
                <label key={id}>
                  <span><Icon size={14} />{label}<em>{badge}</em></span>
                  <input type="checkbox" checked={layers[id]} onChange={() => toggleLayer(id)} />
                  <i />
                </label>
              ))}
              {officialBuildingsStatus !== 'idle' && (
                <div className={`official-layer-status ${officialBuildingsStatus}`}>
                  <span>
                    {officialBuildingsStatus === 'loading' && '2025 產權建物載入中…'}
                    {officialBuildingsStatus === 'ready' && '2025 產權建物 I3S 已載入'}
                    {officialBuildingsStatus === 'error' && (officialBuildingsError ?? '官方模型載入失敗')}
                  </span>
                  {officialBuildingsStatus === 'error' && <button type="button" onClick={retryOfficialBuildings}>重新載入</button>}
                </div>
              )}
            </div>
            <div className="basemap-section">
              <div className="subheading"><b>底圖模式</b><span>BASE</span></div>
              <div className="basemap-options">
                <button className={baseMap === 'neutral' ? 'active' : ''} onClick={() => setBaseMap('neutral')}><Layers3 size={14} /><span>中性城市圖</span></button>
                <button className={baseMap === 'context' ? 'active' : ''} onClick={() => setBaseMap('context')}><Map size={14} /><span>地理位置圖</span></button>
                <button className={baseMap === 'orthophoto' ? 'active' : ''} onClick={() => setBaseMap('orthophoto')}><Satellite size={14} /><span>正射影像</span></button>
              </div>
              <p className={baseMapError ? 'error' : ''}>{baseMapError ?? baseMapMetadata[baseMap].description}</p>
            </div>
            <div className="city-data-note"><Info size={13} /><p>本頁只呈現可追溯的真實城市圖資。營運 Demo 點位待完成建物 mapping 後再接入。</p></div>
          </aside>

          <aside className="gis-right-panel city-right-panel">
            {selectedOfficial ? (
              <section className="glass-panel official-building-detail">
                <div className="detail-hero">
                  <span className="detail-status"><i />官方三維建物</span>
                  <button onClick={() => selectOfficialBuilding(null)} aria-label="關閉官方建物資訊">×</button>
                  <small>TAIPEI CITY I3S</small><h2>{selectedOfficial.address ?? '未提供門牌'}</h2>
                  <p><MapPin size={11} />臺北市政府三維產權模型</p>
                </div>
                <dl className="official-building-fields">
                  <div><dt>樓層</dt><dd>{selectedOfficial.floor ?? '—'} / 共 {selectedOfficial.floorCount ?? '—'} 層</dd></div>
                  <div><dt>樓地板高</dt><dd>{formatMeters(selectedOfficial.floorElevation)}</dd></div>
                  <div><dt>樓層高度</dt><dd>{formatMeters(selectedOfficial.floorHeight)}</dd></div>
                  <div><dt>高度來源</dt><dd>{selectedOfficial.heightSource ?? '—'}</dd></div>
                  <div><dt>主要用途</dt><dd>{selectedOfficial.usage ?? '—'}</dd></div>
                  <div><dt>主要建材</dt><dd>{selectedOfficial.material ?? '—'}</dd></div>
                </dl>
                <p className="official-data-note">官方建築資料 · 尚未綁定營運數據</p>
              </section>
            ) : (
              <section className="glass-panel city-scene-guide">
                <div className="gis-panel-heading"><div><small>SCENE GUIDE</small><h2>城市場景導覽</h2></div><MousePointer2 size={17} /></div>
                <div className="city-scene-guide__body">
                  <Building2 size={24} />
                  <h3>選取一棟官方建物</h3>
                  <p>點擊模型即可查看門牌、樓層、用途與建材等公開欄位。</p>
                </div>
                <ul>
                  <li><i />城市背景：NLSC 114_A（不可選取）</li>
                  <li><i />產權建物：CB_2025（可選取）</li>
                  <li><i />底圖：內政部國土測繪中心</li>
                  <li><i />目前視角：{formatCameraScale(cameraScale)}</li>
                  <li className="pending"><i />營運資料：尚未建立 mapping</li>
                </ul>
              </section>
            )}

            <section className="glass-panel city-source-card">
              <div className="gis-panel-heading"><div><small>DATA PROVENANCE</small><h2>資料來源</h2></div><Database size={17} /></div>
              <dl>
                <div><dt>三維建物</dt><dd>臺北市政府</dd></div>
                <div><dt>城市背景</dt><dd>NLSC 114_A</dd></div>
                <div><dt>產權模型</dt><dd>CB_2025_20250825</dd></div>
                <div><dt>電子地圖</dt><dd>內政部國土測繪中心</dd></div>
                <div><dt>座標系統</dt><dd>WGS84</dd></div>
              </dl>
            </section>
          </aside>

          <div className="gis-source-badge city-source-badge">{baseMapMetadata[baseMap].source} <i /> WGS84</div>
        </section>
      </main>
    </div>
  )
}

function formatLayerStatus(status: 'idle' | 'loading' | 'ready' | 'error') {
  if (status === 'ready') return '官方建物已就緒'
  if (status === 'loading') return '官方建物載入中'
  if (status === 'error') return '官方建物載入異常'
  return '等待載入'
}

function formatCameraScale(scale: 'city' | 'district' | 'building') {
  if (scale === 'city') return '城市尺度'
  if (scale === 'building') return '建物尺度'
  return '街廓尺度'
}

function formatMeters(value: number | null) {
  return value === null ? '—' : `${value.toFixed(2)} m`
}
