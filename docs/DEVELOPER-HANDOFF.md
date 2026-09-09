# Developer Handoff — Bassir Owner Eyes

**Branch:** `claude/bassir-owner-eyes-system-aogee5`
**Base:** `main` (fully synced — branch contains 100% of `main` and `deployment`)
**Scope of this document:** everything changed on this branch on top of `main`, so you can review, maintain, and extend it.

> Architecture reminder: dependency-light vanilla-JS front end. Scripts load in order via `public/index.html`. Same core logic (`shared/api-core.js` + `shared/seed-data.js`) runs on the Node server **and** in the browser "demo mode" (`window.DEMO_MODE`). No build step for the app itself; `tools/build-demo.js` only bundles the standalone demo.

---

## 1. New viewers (in-browser, offline, no cloud)

### `public/js/bim-viewer.js` (new)
Real 3D IFC/BIM viewer using **web-ifc (WASM) + three.js**, both vendored under `public/vendor/bim/`.
- Public API: `window.BimViewer.open({ title, url })`. Exposes `window.BimViewer._last = { meshCount, triCount }` after load (used by tests).
- Streams meshes via `api.StreamAllMeshes`, builds `THREE.BufferGeometry`, manual orbit/zoom (no OrbitControls dependency), fit + wireframe buttons.
- **Gotcha:** WASM path is set with `api.SetWasmPath('/vendor/bim/', true)` — the second `true` (absolute) is required or web-ifc double-prepends the path and 404s.

### `public/js/dxf-viewer.js` (new)
Pure-JS DXF parser + Canvas 2D renderer (no dependencies). Real measurable vector lines.
- Public API: `window.DxfViewer.open({ title, url })`, `window.DxfViewer.parse(text)`, `window.DxfViewer._DxfView` (class), `window.DxfViewer._last`.
- Entities: LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, TEXT, MTEXT, POINT. Features: fit-to-bounds, wheel zoom, drag pan, layer toggles, two-point measure tool (real drawing units), scale bar, live coordinates.

### `public/js/viewer.js` (modified) — DrawingViewer integration
- `fileOf()` now also detects `isDxf` (`DXF_EXT = /\.dxf$/i`).
- When a document's file is `.dxf`, the DrawingViewer renders an inline DXF canvas (toolbar: fit + measure) instead of the blank markup sheet. PDF path (PDF.js) unchanged.
- `viewerBtn()` label shows `📐 DXF` / `📄 PDF` / `🖊 المخطط` accordingly.

### `public/index.html` (modified)
Added `<script src="/js/bim-viewer.js">` and `<script src="/js/dxf-viewer.js">` after `viewer.js`. **If you add/remove front-end scripts, also update `tools/build-demo.js` `SCRIPTS[]` (see §7).**

### Vendor assets (new, large — keep in git or move to CDN/LFS as you prefer)
`public/vendor/bim/`: `three.module.js`, `web-ifc-api-iife.js`, `web-ifc.wasm`, `BassirTower.ifc` (real model, see §5), `BassirTower-sample.ifc` (tiny sample).
`public/vendor/sample/`: `A-101-ground-floor.pdf`, `A-305-section.pdf`, `A-101-ground-floor.dxf`.

### `server/server.js` (modified)
MIME map extended: `.wasm → application/wasm`, `.ifc → text/plain`, `.dxf → text/plain`. Ensure your production static server serves these types too.

---

## 2. PDF display fix (`shared/seed-data.js`)
Seeded shop/plan drawings previously had `file` as a bare string (no URL) → the viewer had nothing to render (blank sheet). Changed to real objects `{ name, url }` pointing at the sample PDFs, so AutoCAD-exported-as-PDF drawings actually render via PDF.js. **No schema change required for real data** — real uploads already produce `{name,url}`.

---

## 3. IA restructure (per "Owner Eyes IA & Display System Restructure Spec")
Implemented in 3 phases. All changes are additive/refactors; no functionality removed (duplicates became views/tabs).

### Phase 1 — foundation (`public/css/styles.css`, `public/js/views.js`, `public/js/views3.js`)
- **Semantic colour system** (spec §7-1): CSS tokens `--status-critical/-warning/-ok/-info/-none` and `--brand`. Legacy tokens `--ok/--warn/--danger/--info` now alias the semantic ones, so the whole app recolours from one place. Gold (`--brand`) is identity/buttons only, never a status.
- **Progress bars coloured by deviation** (§7-2): new helpers in `ViewsShared`:
  - `barClass(actual, planned, threshold)` → `b-ok | b-warn | b-danger | b-none`.
  - `progressBar(actual, planned, projectObj)` → ready `<div class="bar …">` (reads threshold from project settings).
  - CSS bar classes `.bar.b-ok/.b-warn/.b-danger/.b-none` added.
- **Unified status dictionary + mandatory icons** (§7-3): `STATUS` map extended with `[label, class, icon]`; `pill(status)` and new `statusPill(cls, text, icon)` render an icon beside the colour (never colour alone — accessibility/print).
- **Number formatting** (§10-3 / §13-6): `fmtInt(n)` = rounded, thousands-separated; `money(n)` rounds for display. **Display-only** — data/exports keep full precision.
- **Technical → user messages** (§9-2): "Live streaming not configured — MEDIA_SERVER_URL" → "الكاميرات غير مفعّلة — تواصل مع مدير النظام"; dispatch "Simulation" badge → grey "الإرسال غير مفعّل". MediaMTX/.env hint gated to admin only.
- **Projects board** (`views3.js`): deviation-coloured bar + planned-vs-actual on the card; the meaningless "files in repository" counter replaced by an **overdue-activities** counter; zero counters render faded grey.

New exports on `window.ViewsShared`: `statusPill, barClass, progressBar, fmtInt` (plus existing `pill, money, millions, …`).

### Phase 2 + navigation restructure (`public/js/app.js`, `public/css/styles.css`)
This is the biggest change. **Read `public/js/app.js` first.**
- **24 → 14 items in 7 lifecycle sections** (spec §5): نظرة عامة · الأعمال والاعتمادات · المقاولون · الموقع والمتابعة · المستندات والنماذج · التسليم · الإعدادات. (13 visible to non-admin; System Settings admin-only.)
- **Tabbed parent screens** via a new `tabbed(pageId, tabsDef)` factory — it **reuses the existing render functions** unchanged, just presents them under a tab bar, with per-tab role gating:
  - `submittals` (التقديمات والاعتمادات): tabs all-records / awaiting-my-decision / submissions / change-orders / RFI·RFP — single source of truth (§4-1).
  - `contractors`: Performance / Contracts / Company Profiles (merges 3 screens).
  - `reports`: Create / Send.  `documents`: Documents / Project docs.  `bim`: Models / Upload.
- **Screen renames** (§0.1): Project Vision→Progress Map, Site Cameras→Site Monitoring, Bassir AI→Visual Monitoring, Technical Office Services→Technical Office Records, Central File Server→Documents, BIM Management→BIM Models & Drawings.
- **`ALIAS` map + `resolveId()`**: old page ids (e.g. `vision`, `approvals`, `file-server`, `phases`, `system`, `daily`, `submissions`) redirect to the new ids/tabs, so saved links and internal `ctx.nav(...)`/`data-nav` calls keep working (§13-9). **When you add a page, add its alias if you rename an old id.**
- **Real `<a>` links** for nav items (§10-4): ctrl/cmd-click opens in a new tab; normal click is intercepted for SPA nav. Nav **search** field + **"‹ كل المشاريع"** top link + **breadcrumbs** (`.crumbs`) added.
- **Single badge definition** (§13-8): only `submittals` carries a badge = "awaiting your action" (`badgeMyDecision`). Per-page badges removed.

### Phase 3 (touches) (`public/js/views4.js`, `views2.js`, `views3.js`)
- **Configurable deviation threshold** (§13-5): Project Settings (`renderPhases`) now edits `thresholds.progressAmberPct` (default 10). `ViewsShared.DEFAULT_THRESHOLDS` gained `progressAmberPct`. The progress-bar colour rule reads it per project.
- Stale/misleading headings corrected: "خادم الملفات المركزي"→"المستندات"; archive heading→"سجل كل المعاملات"; a nav button label "رؤية المشروع"→"خريطة الإنجاز".

---

## 4. Drawing ↔ BOQ progress ("dark → bright") — verified, not newly built
This feature already existed in `public/js/views.js` (`renderVision` / Progress Map). Chain confirmed working end-to-end:
1. Contractor submits an IPC/مستخلص with BOQ lines + new % (payment modal in `views2.js`).
2. Consultant approves → `shared/api-core.js` `applyPaymentEffects()` raises `boqItem.progress` (per-contractor).
3. `renderVision` shades zones/floors via `mixColor()` × `weightedProgress()` — dark when incomplete, glowing bright at ≥95%.
**BOQ is per-contractor**: `api-core.js getState()` filters `boqItems` by `contractorId` for the contractor role.

---

## 5. Real BIM model (`public/vendor/bim/BassirTower.ifc` + `tests/gen-ifc.js`)
The old sample was a single box. `tests/gen-ifc.js` generates a valid **IFC4** multi-storey tower (8 floors, 248 elements: slabs, columns, service core, perimeter walls, and a **glazed curtain-wall facade** with mullions), with surface styles (concrete/glass/…). web-ifc renders it as **248 meshes**. Regenerate with `npm run gen:ifc`.
Wired in: `views3.js` demo-3D button + seeded `bimModels` entry `BM2` (`url: /vendor/bim/BassirTower.ifc`). The 3D viewer now also opens **in demo mode** (it is fully client-side).

---

## 6. Seed data (`shared/seed-data.js`)
`db.meta.version` bumped to **19**. On the server, bump/reseed as needed (`npm run seed`). Additions: sample PDF/DXF file objects, `planDrawings` PD7 (DXF), `bimModels` BM2 (real IFC). The client demo auto-reseeds when the stored `version` is older.

---

## 7. Demo bundle fix (`tools/build-demo.js`) — **important**
The standalone demo (`demo/bassir-demo.html`, `demo/bassir-demo-artifact.html`, published via `npm run build:demo`) was **broken**: its `SCRIPTS[]` list was stale — missing `public/js/i18n.js` (so `I18n` was undefined → "Cannot read properties of undefined (reading 't')") and the two new viewers. Fixed the list to match `index.html` load order and rebuilt.
**Maintenance rule:** whenever you change the `<script>` tags in `public/index.html`, update `SCRIPTS[]` in `tools/build-demo.js` and rerun `npm run build:demo`.

---

## 8. Regression tests (`tests/`) — new
Real browser tests (Playwright) that run the app in demo mode with no server, by intercepting requests and serving repo files. **Run before each deploy.**

```bash
npm i -D playwright && npx playwright install chromium
npm test                      # smoke + crawl + brightness + cycle + bim
# or individually:
npm run test:smoke            # all 5 roles, every page renders, 0 JS errors
npm run test:crawl            # clicks every tab/filter/button, opens/closes every modal
npm run test:brightness       # IPC → approval → Progress Map dark→bright (objective)
npm run test:cycle            # "day on site": upload WIR/RFI/materials + plan + approve
npm run test:bim              # real IFC renders as many meshes
npm run gen:ifc               # regenerate the BIM tower
```
Set `CHROME_PATH=/path/to/chrome` to use an existing Chromium (CI). Screenshots land in `tests/output/`. Shared helpers in `tests/_harness.js`.
**Last full run: 0 JS errors across all 5 roles** (62 page-loads, 90 tab/filter clicks, 177 button clicks, 98 modals).

---

## 9. Mobile app design handoff (`docs/mobile-design-handoff/`) — reference only
Hi-fi design reference (14 screens) for building the Bassir mobile app in **React Native** (not WebView). Includes full spec: design tokens, navigation, state management, API requirements, offline, store submission. `.dc.html` files are visual references, not production code.

---

## 9b. Contractor BOQ & Schedule pages (`public/js/views5.js` — new)
New module `window.ViewsExtra`, loaded after `views4.js` (added to `index.html` and `build-demo.js`).
- **Contractor BOQ** (`renderContractorBoq`, page id `boq-c` in the contractor "أعمالي" section): per BOQ item shows unit price, quantity, **completed** (= qty × approved `progress`), **in-progress** (= quantity claimed in *pending* IPCs, `payments[status=pending].lines`), **remaining**, and a **delay indicator** vs the contractor's schedule window: green «ضمن الجدول» / amber «سيتأخر — سرّع العمل» / red «متأخر». Thresholds from `project.thresholds.progressAmberPct` (amber) and 2× (red), or past-end-date ⇒ red.
- **Schedule** (`renderSchedule`, page id `schedule-c` for contractor; `schedule` in "الموقع والمتابعة" for consultant/admin/owner): displays `scheduleTasks` (planned/actual/progress) with the same delay indicator vs today, plus a submissions-status table.
- **Schedule file reader** (`parseScheduleFile(file)` → `[{name,start,end,progress}]`): real parsers for **CSV/TSV** (header auto-detect, AR/EN keywords), **Primavera XER** (TASK table), **P6 XML** (`<Activity>`/`<Task>`), and **Excel XLSX** — the XLSX reader unzips with the browser's built-in `DecompressionStream('deflate-raw')` and parses `sheet1.xml` + `sharedStrings.xml` (no external library). **PDF** is best-effort text extraction via the vendored PDF.js.
- **Approval cycle for the programme (single source of truth):** upload → parse → creates a `scheduleSubmittals` item carrying `parsedTasks` (+ the file). **Contractor** submits it as `pending` ("📤 إرسال للاستشاري للاعتماد"); **consultant/admin** either approve the contractor's submission in Submittals → "بانتظار قراري" → "الجداول الزمنية", or upload+auto-approve directly (create then `Api.review approved`). On approval, `shared/api-core.js` `applyScheduleEffects(item)` **replaces that project's `scheduleTasks`** with `parsedTasks` → it becomes the official schedule everyone sees. (Mirror of `applyPaymentEffects`; wired in `review()` for `collection === 'scheduleSubmittals'`.)
- Helpers exported: `delayStatus(actual,start,end,amberTh,redTh)`, `expectedPct(start,end)`.
- **Maintenance:** if you change `index.html` script tags, keep `tools/build-demo.js` `SCRIPTS[]` in sync (views5.js is included).

## 10. Suggested review order for you
1. `public/js/app.js` — nav model, `tabbed()`, `ALIAS`/`resolveId`, sidebar/breadcrumbs. (Highest impact.)
2. `public/js/views.js` — `ViewsShared` helpers (`statusPill/barClass/progressBar/fmtInt`), STATUS map.
3. `public/css/styles.css` — semantic tokens + `.bar`/`.pill`/`.tabbar`/`.crumbs`/`.nav-*`.
4. `public/js/bim-viewer.js`, `dxf-viewer.js`, `viewer.js` — viewers.
5. `tools/build-demo.js` + `tests/` — deploy tooling & tests.

## Notes / limitations
- Native **DWG/RVT** cannot be opened free/offline (Autodesk-proprietary). Real path is Autodesk Platform Services (cloud, your credentials). Free/offline options implemented: **IFC 3D, DXF vector, DWG→PDF**.
- Demo mode simulates file uploads by name (no storage); the real server stores files.
