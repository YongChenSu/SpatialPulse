# SpatialPulse Devlog

Devlog 用來保留「為什麼這樣做」以及開發當下的證據；根目錄 [`CHANGELOG.md`](../../CHANGELOG.md) 則只整理已完成的階段成果。

## 紀錄原則

- 一個可辨識的研究主題、技術決策或階段成果建立一篇 Markdown。
- 檔名使用 `YYYY-MM-DD-topic.md`。
- 尚未完成的內容明確標為 WIP，不寫成已正式發布。
- 記錄資料來源、嘗試過的方法、驗證方式、結果與下一步。
- 截圖可放在 `docs/assets/devlog/<date>/`，避免散落在專案根目錄。
- 每篇 devlog 都要加入下方索引，重要成果再同步摘要到 `CHANGELOG.md`。

## 建議格式

```md
# 標題

| 項目 | 內容 |
| --- | --- |
| 日期 | YYYY-MM-DD |
| 狀態 | WIP / Completed / Blocked |
| Branch | branch-name |
| Related commits | commit hashes |

## 目標

## 背景與問題

## 本次完成

## 技術決策

## 驗證結果

## 已知問題

## 下一步
```

## 索引

| 日期 | 主題 | 狀態 |
| --- | --- | --- |
| 2026-11-03 | [2025 產權建物數位孿生候選：長虹雲端科技大樓](2026-11-03-cadastral-digital-twin-candidate.md) | Candidate selected |
| 2026-11-02 | [從 Demo 建築到真實臺北三維城市](../spatialpulse-gis-development-summary.md) | WIP，已完成階段整理 |

## 與 commit 的搭配方式

開發途中不需要每次都部署，但每個可說明的階段應留下：

1. 可以執行或驗證的程式修改。
2. 一篇 devlog 或既有 devlog 的更新。
3. `CHANGELOG.md` 中一條面向成果的摘要。
4. 清楚的 commit message。
5. push 到目前的遠端 feature branch。

建議 commit 類型：

```text
feat: 可被使用者使用的新功能
fix: 問題修正
refactor: 不改功能的架構調整
data: GIS 資料來源或處理流程
docs: devlog、研究紀錄或使用說明
test: 測試與驗證補強
```
