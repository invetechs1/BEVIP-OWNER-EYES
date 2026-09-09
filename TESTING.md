# Bassir · Owner Eyes — Feature Verification Checklist

A plain-language, step-by-step guide for confirming the features covered in the client's requirements notes are working — no technical background required. Follow each section in order and check off the result once you've confirmed it.

**Platform:** bassir-owner-eyes.bassir.net
**Scope:** Project Phases · Handover & Closeout Module · 8 standalone features
**Languages tested:** Arabic & English

---

## 0. Getting Started

### 0.1 Open the site & choose a language

1. Go to `bassir-owner-eyes.bassir.net`
2. On the login screen, click **English** or **العربية** at the top — either works identically, this just changes the display language. You can switch again at any time from the same toggle at the top of the sidebar once logged in.

### 0.2 Sign in

Use the account for the role you're testing. You can click an account chip on the login screen to auto-fill it, or type these in directly.

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Owner | `owner` | `owner123` |
| Owner's Representative | `rep` | `rep123` |
| Consultant | `consultant` | `consult123` |
| Contractor (structural) | `cont-str` | `cont123` |

---

## A. Project Phases

Confirms the platform now covers all 18 phase types the client asked for — from design approvals through the defects liability period — and that phases can be tailored to the type of project.

### A.1 — Full phase list is available
**Role required:** Admin or Consultant

1. Sign in as `consultant` (or `admin`).
2. In the sidebar, under the "Technical Office" section, click **Project Phases**.
3. Count the phases listed for the current project.

**Expected:** phases appear with a progress bar each. A commercial-tower project (like the demo project) will show **15** — that's correct, not a shortfall: 3 phases (Steel Structure, Landscaping, Infrastructure) are intentionally left out because they don't apply to a tower. The full catalogue of 18 phase types is still available — see A.2.

- [ ] Confirmed

### A.2 — Phases can be customized per project type
**Role required:** Admin or Consultant

1. On the same Project Phases page, open the template dropdown near the top ("Apply template by type...").
2. Choose a different project type, e.g. "Industrial Complex / Warehouses."
3. Confirm you're asked before anything is added, and that only the missing phases for that type get added — nothing already there is removed or duplicated.
4. Click **"+ Phase"** and check the "pick from library" list — it should offer all 18 phase types regardless of project type.

**Expected:** applying a template adds only the phases relevant to that project type; the full list of 18 is always reachable when adding manually.

- [ ] Confirmed

---

## B. Handover & Closeout Module

The dedicated module covering every document, regulatory approval, and tracking tool from the client's Handover Phase requirements. Six tabs, tested individually below.

### B.1 — Interactive handover checklist
**Role required:** Consultant, Admin, Owner, or Owner's Rep

1. Sidebar → **Handover & Closeout** → first tab, **Handover Checklist**.
2. Confirm you can see all 8 document items (Preliminary/Final Certificates, Punch List, T&C Certificates, O&M Manuals, As-Built Drawings, Warranty Certificates, Consultant Inspection Report) and all 5 regulatory items (Municipality, Civil Defense, SEC, Occupancy, Keys Log).
3. Click "Update" on any item, change its status, add a note, attach a file, and save.

**Expected:** the item updates immediately and the completion bar at the top of the page moves.

- [ ] Confirmed

### B.2 — Punch list, linked to contractor with open/close tracking
**Role required:** Consultant/Admin to create · any assigned Contractor to view

1. Tab → **Punch List**. Confirm items are grouped by contractor with open/closed counts.
2. As consultant/admin, add a new item and assign it to a contractor.
3. Log out, sign back in as `cont-str`, and confirm the new item is visible to them.
4. Close an open item and confirm the closed date fills in automatically.

- [ ] Confirmed

### B.3 — Warranty expiry tracking
**Role required:** Consultant, Admin, Owner, or Owner's Rep

1. Tab → **Warranties**. Confirm the 5 seeded warranties show with countdowns to expiry.
2. Add a new one with an end date a few days from today, then reload the tab.

**Expected:** it appears in the "expiring soon" banner at the top of the tab. *Note: this warning is only visible when someone opens this tab — see Known Limitations below.*

- [ ] Confirmed

### B.4 — Keys handover log
**Role required:** Consultant, Admin, Owner, or Owner's Rep

1. Tab → **Keys Log**. Confirm the 2 seeded entries show.
2. Add a new one and confirm it saves.

- [ ] Confirmed

### B.5 — Defects Liability Period (DLP) dashboard
**Role required:** Consultant, Admin, Owner, or Owner's Rep

1. Tab → **DLP Dashboard**.
2. Confirm it shows a start/end date, days remaining, and how many punch-list items are still open during the period.

- [ ] Confirmed

### B.6 — Unified handover report, in Arabic or English
**Role required:** Consultant, Admin, Owner, or Owner's Rep

1. Tab → **Unified Handover Report**.
2. Click the Arabic export button, then separately the English one.
3. Confirm a print-preview window opens each time, with the checklist, punch summary, and warranties shown in the language you picked.

**Expected:** a correctly formatted, bilingual report. Use your browser's "Save as PDF" option in the print dialog to get an actual PDF file. *Note: this is a print-to-PDF flow, not a direct-download PDF like the weekly/monthly reports — see Known Limitations.*

- [ ] Confirmed

---

## C. Other Platform Features

The eight standalone items from the client's notes, each mapped to where it lives in the platform today.

### C.1 — Actual vs. planned progress, per contractor
**Role required:** Owner, Owner's Rep, Consultant, or Admin

1. Sidebar → **Contractors & Performance**.
2. Confirm the chart compares actual % against planned % for each individual contractor.

- [ ] Confirmed

### C.2 — BOQ upload, linked to completion %
**Role required:** Consultant or Admin

1. Sidebar → **Bill of Quantities** → try uploading a file directly.
2. Sidebar → **Manage Contractors** → try "Import from CSV" (download the template first, fill a couple of rows, re-upload).
3. Confirm new line items appear with a progress slider, and that moving it changes the corresponding drawing's brightness on the Project Vision page.

- [ ] Confirmed

### C.3 — One-click weekly / monthly report, ready to send
**Role required:** Owner, Owner's Rep, Consultant, or Admin

1. Sidebar → **Reports & Sending**.
2. Click any of the 4 buttons (Weekly Arabic/English, Monthly Arabic/English).

**Expected:** a PDF downloads immediately — not a print dialog — with KPIs, contractor performance, and alerts, in the chosen language.

- [ ] Confirmed

### C.4 — Custom phases per project type
**Role required:** Admin or Consultant

Already covered above in A.1 and A.2.

- [ ] Confirmed

### C.5 — Camera safety alerts → archivable, printable incident reports
**Role required:** Owner, Owner's Rep, Consultant, or Admin

1. Sidebar → **Site Cameras** or **Bassir AI**.
2. Find an alert marked with a red/critical icon and click the incident-report button on it.
3. Fill in the details and save.

**Expected:** the alert is now marked as archived, and you can print or download the incident report as a PDF.

- [ ] Confirmed

### C.6 — "Assigned Party" field on AI alerts
**Role required:** Owner, Owner's Rep, Consultant, or Admin

1. Sidebar → **Bassir AI**.
2. Confirm each alert has a dropdown to assign it to a contractor.
3. Assign one, then sign in as that contractor and confirm they can see it — and check their notification bell for an alert.

- [ ] Confirmed

### C.7 — Bilingual report export (Arabic / English)
**Role required:** Owner, Owner's Rep, Consultant, or Admin

Already covered above in C.3 — confirm both language buttons produce genuinely different-language content, not just a relabeled button.

- [ ] Confirmed

### C.8 — Cash flow chart, linked to completion rate
**Role required:** Owner, Owner's Rep, Consultant, or Admin

1. Sidebar → **Dashboard**.
2. Confirm the "Cash Flow vs. Progress" card shows money in vs. money out per period, alongside that period's completion percentage.

- [ ] Confirmed

---

## Known Limitations

Two items from the original notes that work, but not exactly the way they were described. Worth knowing before reporting them as bugs.

> **⚠ Warranty expiry alerts are visual-only, not push notifications**
> Opening the Warranties tab correctly highlights anything expiring soon — but nothing is sent to the notification bell, email, or WhatsApp on its own. Every other alert in the platform (submissions, reviews, project health) does push a real notification; this one currently doesn't.

> **⚠ The Unified Handover Report exports via print dialog, not a direct PDF download**
> Every other report (weekly, monthly, incident) downloads a PDF file the moment you click the button. The Handover report instead opens a browser print-preview window — you get a real PDF if you choose "Save as PDF" there, but it's a different, slightly less polished path than the rest of the reporting.

---

## Notes & Issues Found While Testing

*(Use this space to jot down anything that didn't match what this document describes — section number, what you expected, what you actually saw.)*

-
-
-
