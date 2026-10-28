# 雨湖 · Rain Lake

細雨落在傾斜四十五度的湖面，擴散的漣漪交疊、增強或抵消，水下偶爾透出緩慢游動的魚影。暗灰藍、滿版、沒有畫面文字或控制列，也沒有岸景與音效。

由曲宸宇（Chu, Chen-Yu；GitHub：[poplolioi11](https://github.com/poplolioi11)）發想與決定美術方向，AI協作實作。採 **MIT授權**，歡迎各式使用與改作。

## 兩個版本，免登入試看

| 版本 | 試看 | 畫面更新目標 |
| --- | --- | --- |
| 平滑水波 | [Smooth](https://poplolioi11.github.io/rain-lake/smooth/) | 24fps上限 |
| ASCII字元 | [ASCII](https://poplolioi11.github.io/rain-lake/ascii/) | 60fps上限 |

平滑版保留柔和水面光影及細字元筆觸；ASCII版的水波、雨絲、落點與魚影只使用可列印ASCII字元，背景保留簡單漸層。兩版皆保留相同題材與45度俯視方向。

![平滑水波版](assets/smooth.jpg)

![ASCII版](assets/ascii.jpg)

[下載雙版本 v0.2.0](https://github.com/poplolioi11/rain-lake/releases/tag/v0.2.0)。兩個網頁ZIP可分別架站，Source code含完整程式與驗證腳本。

## 創作靈感

這一系列從 [stackedlol/ascii-sharks](https://github.com/stackedlol/ascii-sharks) 的字元生物概念出發，先延伸為 [《雲龍》](https://github.com/poplolioi11/yunlong) 的東方五行與XYZ空間游動，再轉為 [《御三家錦鯉》](https://github.com/poplolioi11/gosanke-koi) 的水景，最後將焦點放在雨與湖面。

《雨湖》以程式繪製波面、雨絲和水下剪影，沒有使用第三方魚、湖面或天空照片。本作沒有畫天空或地平線，陰天以水面反射的暗光呈現。

## 本機使用與架站

沒有外部執行期依賴，不需安裝npm套件或打包。

```sh
git clone https://github.com/poplolioi11/rain-lake.git
cd rain-lake
python3 -m http.server 4340 --bind 127.0.0.1
```

開啟 [ASCII版](http://127.0.0.1:4340/ascii/) 或 [平滑版](http://127.0.0.1:4340/smooth/)。使用原生ES modules，請透過HTTP/HTTPS開啟。

單獨架站時，把 `ascii/dist/` 或 `smooth/dist/` 的全部檔案放到靜態網站空間。Release中的各版網頁ZIP已將該版檔案放在同一資料夾，解壓縮後依內附README執行。

`package.json` 的 `private: true` 用來防止誤發npm；程式仍依MIT公開授權。

## 波面與資源

45度正交投影把水面圓波呈現為短軸約0.707倍的橢圓。雨點擾動帶正負高度的二維線性差分波面，波面相加後再計算明暗或字元，因此交會處可以增強或抵消。邊界吸收與阻尼讓波紋消退。這是美術模擬，並非完整的流體、天候或光學模型。

兩版DPR上限1.25、波面最多60,000格點；背景分頁或系統「減少動態效果」會暫停。可搭配支援網頁的桌布工具使用，本專案尚非macOS原生桌布安裝包。

ASCII版曾在這台Mac的隱藏瀏覽器、1280×720下，40.298秒內記錄2418次畫面更新，平均約60fps。這是有限環境的平均畫面計數，不代表所有裝置或每一幀都能穩定60fps；桌布工具中的GPU、總RAM與電池消耗尚未量測。

## 驗證與程式結構

使用Node.js22以上，不需安裝依賴：

```sh
node scripts/check.mjs
npm test
```

兩版均含波面零場、有符號相消、線性疊加、衰減、極端尺寸與時間步、場景及排程測試；ASCII版另檢查可見畫布字元為ASCII 32–126。這些程式測試不取代跨裝置視覺與效能檢查。

| 路徑 | 用途 |
| --- | --- |
| `smooth/dist/` | 原本平滑水波版，24fps目標 |
| `ascii/dist/` | 字元版，60fps目標 |
| 各版 `dist/wave-field.js` | 有符號波面與吸收邊界 |
| 各版 `dist/fish-shadows.js` | 水下魚影與慢速游動 |
| 各版 `scripts/` | 可重跑驗證 |

## 使用、貢獻與授權

歡迎個人桌布、網站背景、展示、教學、研究、改作、再散布與商業用途。請保留MIT著作權與授權聲明。歡迎衍生自己的雨勢、水景或生物；貢獻方式見 [CONTRIBUTING.md](CONTRIBUTING.md)。

MIT License，Copyright (c) 2026 Chen-Yu Chu (曲宸宇)。授權見 [LICENSE](LICENSE)，來源與原始ascii-sharks的MIT聲明見 [NOTICE.txt](NOTICE.txt)。

人類提供主題、需求與美術取捨；Codex主代理與助手實作、整合及驗證，Gemini協助初版畫面的視覺覆核。AI協作不代表所有視覺、物理與效能限制已被排除。
