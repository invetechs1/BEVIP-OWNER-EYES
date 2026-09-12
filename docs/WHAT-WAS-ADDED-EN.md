# Bassir – Owner Eyes — What Was Added (Developer Instructions)

**Audience:** the project's developer.
**Branch:** `claude/bassir-owner-eyes-system-aogee5` (fully synced on top of `main` and `deployment`).
**How the app is built:** dependency‑light vanilla JavaScript. Front‑end scripts load in order from `public/index.html`. The **same** business logic (`shared/api-core.js` + `shared/seed-data.js`) runs on the Node server **and** in the browser "demo mode" (`window.DEMO_MODE`). There is **no build step for the app itself** — only `tools/build-demo.js` bundles the standalone demo.

> Read this once end‑to‑end, then use §11 (How to run & test) and §12 (Maintenance rules) as your day‑to‑day reference.

---

## 1. New in‑browser viewers (offline, no cloud, no paid service)

| File | What it does |
|---|---|
| `public/js/bim-viewer.js` | Real **3D IFC/BIM viewer** (web‑ifc WASM + three.js). API: `window.BimViewer.open({title, url})`. |
| `public/js/dxf-viewer.js` | Pure‑JS **DXF viewer** (real measurable vector lines): parse LINE/LWPOLYLINE/POLYLINE/CIRCLE/ARC/TEXT, Canvas 2D, pan/zoom/measure/layers. API: `window.DxfViewer.open({title, url})`. |
| `public/js/viewer.js` (edited) | `DrawingViewer` now detects `.dxf` and renders it inline (alongside the existing PDF.js viewer). |

**Vendored assets** (`public/vendor/bim/`): `three.module.js`, `web-ifc-api-iife.js`, `web-ifc.wasm`, `BassirTower.ifc` (real 8‑storey model), `BassirTower-sample.ifc`. **Sample drawings** (`public/vendor/sample/`): `A-101-ground-floor.pdf`, `A-305-section.pdf`, `A-101-ground-floor.dxf`.

**Server (`server/server.js`)**: MIME types added — `.wasm`, `.ifc`, `.dxf`. Make sure production static hosting serves these too.

**Gotcha:** web‑ifc's WASM path is set with `api.SetWasmPath('/vendor/bim/', true)` — the `true` (absolute) flag is required.

---

## 2. Real BIM building model
`public/vendor/bim/BassirTower.ifc` is a valid **IFC4** multi‑storey tower (8 floors, ~248 elements: slabs, columns, service core, walls, and a glazed curtain‑wall facade). It renders as ~248 meshes in the 3D viewer. Regenerate it any time with `npm run gen:ifc` (source generator: `tests/gen-ifc.js`). Wired into the BIM page and it opens in demo mode too.

---

## 3. PDF drawings fix
Seeded drawings previously stored `file` as a bare string (no URL) → the viewer showed a blank sheet. Fixed in `shared/seed-data.js` to `{name, url}` objects pointing at real sample PDFs. **No change needed for real data** — real uploads already produce `{name, url}`.

---

## 4. Information‑Architecture restructure (from the IA spec)
Implemented in three phases; nothing was removed — duplicates became tabs/filters.

- **Semantic colour system** (`public/css/styles.css`): tokens `--status-critical/-warning/-ok/-info/-none` and `--brand`. Legacy tokens alias the new ones, so the whole app recolours from one place. Gold is identity/buttons only, never a status.
- **Deviation‑coloured progress bars**: helpers in `ViewsShared` — `barClass(actual, planned, threshold)`, `progressBar(actual, planned, project)`.
- **Unified status dictionary with mandatory icons** (accessibility/print): `pill(status)` and `statusPill(cls, text, icon)`.
- **Number formatting**: `fmtInt(n)` / `money(n)` round for **display only**; data and exports keep full precision.
- **Navigation**: 24 screens → **14 items in 7 lifecycle sections** (13 visible to non‑admins). Duplicated screens merged into **tabbed parent screens** via a `tabbed(pageId, tabsDef)` factory in `public/js/app.js` that **reuses the existing render functions**. Old page IDs still work through an `ALIAS` map + `resolveId()` (saved links keep working). Real `<a>` nav links, breadcrumbs, nav search, and a "‹ All Projects" top link were added.
- **Settings split**: System Settings is admin‑only and separated from Project Settings.

---

## 5. Progress Map ↔ BOQ ("dark → bright")
This already existed and is verified working (`public/js/views.js` → Progress Map). Chain: contractor submits an IPC/مستخلص with BOQ lines & new % → consultant approves → `applyPaymentEffects()` (in `shared/api-core.js`) raises `boqItem.progress` → Progress Map zones/floors brighten (dark = incomplete, glowing = complete). **BOQ is per‑contractor** (`getState()` filters `boqItems` by `contractorId`).

---

## 6. Contractor **BOQ page** (`public/js/views5.js` → `renderContractorBoq`, page id `boq-c`)
For every BOQ line the contractor sees: **unit price, quantity, completed qty** (= approved `progress`), **in‑progress qty** (quantity claimed in *pending* IPCs), **remaining qty**, and a **delay indicator vs the schedule**: green «On schedule» / amber «Will slip – speed up» / red «Behind». Delay thresholds come from `project.thresholds.progressAmberPct` (amber) and 2× (red); past the end date ⇒ red.

---

## 7. **Schedule page** + schedule‑file reader (`public/js/views5.js` → `renderSchedule`)
Shows the project schedule (planned/actual/progress) with the same delay indicators vs today. It can **read an uploaded schedule file** and extract tasks/dates/progress:
- **Real parsers:** CSV/TSV, **Primavera XER** (TASK table), **P6 XML** (`<Activity>`/`<Task>`), and **Excel XLSX** (unzipped in‑browser via the built‑in `DecompressionStream('deflate-raw')` — no external library).
- **PDF:** best‑effort text extraction via the vendored PDF.js (PDF layouts vary — prefer CSV/XER/XML/XLSX for reliable import).
- Function: `ViewsExtra.parseScheduleFile(file)` → `[{name, start, end, progress}]`. Generic table reader: `ViewsExtra.parseRows(file)`. BOQ file reader: `ViewsExtra.parseBoqFile(file, floors)`.

---

## 8. BOQ & Schedule **baseline lock + dual‑approval revisions** (the latest request)
The contractor uploads his **own** BOQ and schedule; once approved they become a **locked baseline**; any later change needs **two signatures**.

**Data model** (`shared/api-core.js`):
- Collections `boqSubmittals` (new) and `scheduleSubmittals` are both in `BASELINE_COLLECTIONS`.
- Each submittal has `kind: 'baseline' | 'revision'`, `parsedItems` (BOQ) or `parsedTasks` (schedule), the uploaded `file`, and for revisions `sig: {consultant, ownerRep}`.

**Approval logic** (`review()` in `shared/api-core.js`):
- **Baseline** (first submission): applies on a **single** consultant/admin approval.
- **Revision** (after a baseline exists): requires **consultant AND owner‑representative** signatures; it stays `pending` until both sign, then applies. `owner_rep` may co‑sign **only** these two collections.
- On full approval: `applyBaseline()` → `applyBoqEffects()` (replaces that contractor's `boqItems`) or `applyScheduleEffects()` (replaces the project's `scheduleTasks`).

**UI:**
- Contractor (`views5.js`): upload control on the BOQ and Schedule pages. If an approved baseline exists it shows a 🔒 lock banner and the upload becomes a "revision request"; otherwise it's a "baseline" submission. The contractor sees his submissions' status and which signatures are collected.
- Reviewers: `ViewsExtra.baselineReviewHtml(ctx, collection)` + `ViewsExtra.wireBaselineReview(el, ctx)` render a pending‑approvals panel with per‑role sign/reject buttons — embedded in the Schedule page (`renderSchedule`) and the BOQ page (`renderBoq`). The `boq` page is now visible to `owner_rep` so they can co‑sign BOQ revisions.

---

## 9. Bug fixes reported by the engineers
- **Contractors not showing after being added in a non‑first project**: the add‑contractor form now sends `projectId: ctx.projectId` (it used to default to the first project `P1`, so the contractor "disappeared"). Fixed in `public/js/views2.js` (`nc-save`).
- **BOQ empty after upload**: the BOQ page upload now actually **parses** the CSV/Excel file and creates `boqItems` for the selected contractor (previously it only stored the file). Requires selecting a contractor first. Fixed in `public/js/views2.js` (`renderBoq` / `bq-upload`).

> **Data note:** contractors added *before* this fix were saved under project `P1`. The fix prevents recurrence but does not move existing rows. Either re‑add them in the correct project, or run a one‑off DB update to set their `projectId` (and their `boqItems.projectId`) to the intended project.

---

## 10. Demo bundle fix
`tools/build-demo.js` had a stale script list (it was missing `public/js/i18n.js`, which broke the standalone demo with "Cannot read properties of undefined (reading 't')", plus the two viewers). Fixed to mirror `index.html`'s load order.

---

## 11. How to run & test

**Run the server**
```bash
npm install        # installs pdfkit, arabic-reshaper, pdfjs-dist
npm start          # serves public/ + API on the configured port
npm run seed       # (re)seed the SQLite demo data if needed
```

**Automated regression tests** (real browser via Playwright — run before every deploy):
```bash
npm i -D playwright && npx playwright install chromium   # one time
npm test                 # smoke + crawl + brightness + cycle + bim
# individually:
npm run test:smoke       # all 5 roles, every page renders, 0 JS errors
npm run test:crawl       # clicks every tab/filter/button, opens/closes every modal
npm run test:brightness  # IPC → approval → Progress Map dark→bright
npm run test:cycle       # "day on site": upload WIR/RFI/materials + plan + approve
npm run test:bim         # real IFC renders as many meshes
npm run gen:ifc          # regenerate the BIM tower model
```
Set `CHROME_PATH=/path/to/chrome` to reuse an existing Chromium in CI. Screenshots are written to `tests/output/`. Shared test helpers: `tests/_harness.js`.

**Standalone demo (no server):** `npm run build:demo` → `demo/bassir-demo.html` (open directly in a browser) and `demo/bassir-demo-artifact.html` (for publishing as a page).

**Demo login accounts:** owner `owner/owner123` · owner‑rep `rep/rep123` · consultant `consultant/consult123` · contractor `cont-arch/cont123` · admin `admin/admin123`.

---

## 12. Maintenance rules (important)
1. **Script order:** if you add/remove `<script>` tags in `public/index.html`, mirror the change in `tools/build-demo.js` (`SCRIPTS[]`) and rerun `npm run build:demo`.
2. **New page:** register it in the `PAGES` array in `public/js/app.js` (with `roles` and `render`); if you rename an existing page ID, add an `ALIAS` entry so old links keep working.
3. **Colours/statuses:** use the semantic tokens and `statusPill(...)` — do not hard‑code status colours; never use gold (`--brand`) for a status.
4. **Money/quantities:** round only in the formatter (`fmtInt`/`money`), never in the data layer.
5. **Approvals:** everything approvable flows through `review()` in `shared/api-core.js`. Payment approval → `applyPaymentEffects`; BOQ/Schedule baseline/revision → `applyBaseline` → `applyBoqEffects`/`applyScheduleEffects`.

---

## 13. Known limitations
- Native **DWG/RVT** cannot be opened free/offline (Autodesk‑proprietary). The real path is Autodesk Platform Services (cloud, your credentials/budget). Implemented free/offline options: **IFC 3D**, **DXF vector**, **DWG→PDF**.
- **PDF** schedule import is best‑effort (layouts differ) — prefer CSV/XER/P6‑XML/XLSX.
- In demo mode file uploads are simulated by name (no storage); the real server stores files.

---

## 14. Full commit list on this branch (newest first)
```
جداول الكميات والجدول الزمني: رفع المقاول + اعتماد + قفل خط الأساس + تعديل بموافقة مزدوجة
  → BOQ & Schedule: contractor upload + approval + baseline lock + dual-approval revisions
إصلاح: المقاولون وجدول الكميات لا يظهران بعد الإضافة في مشروع غير الأول
  → Fix: contractors/BOQ not visible after adding in a non-first project
دورة اعتماد الجدول الزمني: المقاول يرفع ← الاستشاري يعتمد ← يصبح الجدول الرسمي
  → Schedule approval cycle: contractor uploads → consultant approves → official schedule
ميزتان للمقاول: جدول الكميات + الجدول الزمني بقراءة ملف
  → Contractor BOQ page + Schedule page with file reader
عارض BIM/IFC + عارض PDF + عارض DXF + نموذج BIM حقيقي
  → BIM/IFC viewer + PDF viewer + DXF viewer + real BIM model
إعادة هيكلة IA (3 مراحل) + اختبارات انحدار + إصلاح مولّد الديمو + مستند تسليم
  → IA restructure (3 phases) + regression tests + demo-bundle fix + handoff docs
```

*(For the fuller technical breakdown see `docs/DEVELOPER-HANDOFF.md`.)*
