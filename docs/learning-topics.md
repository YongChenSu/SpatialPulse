# SpatialPulse 關鍵技術主題列表

1. I3S 格式解剖：3dSceneLayer、nodepages、geometry / attribute resource，1.7 與 1.8+ 差異
2. I3S vs 3D Tiles vs GeoJSON：城市級 3D 資料為什麼不能打成一包 JSON
3. Screen Space Error 與 LOD：用相機高度動態調整 SSE
4. WMTS / XYZ 圖磚與 Tile Matrix：`{z}/{y}/{x}` 背後的 Web Mercator
5. CesiumJS 在 React 中的生命週期管理：Viewer、Provider、事件、destroy 與非同步 race
6. Layer Manager 設計模式：registry、factory、lazy load、取消過期載入
7. 自建 SceneServer snapshot pipeline：併發 pool、retry、atomic write、hard link 發布
8. `NODE_EXTRA_CA_CERTS` 與憑證鏈不完整
9. Cesium `requestRenderMode`：按需渲染
10. React Three Fiber 宣告式 Three.js：`Canvas`、`Html` overlay、事件冒泡
11. 即時資料降級策略：WebSocket + timeout + 本地模擬 fallback
12. Vite 打包 Cesium：靜態資源複製與 `CESIUM_BASE_URL`
13. 用 Playwright 驗證 WebGL 場景：監聽 request 而非截圖比對
