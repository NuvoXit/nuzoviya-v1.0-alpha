# Green UI Theme + UI Polish (CSS-Only Overhaul)

Transform the entire Hospital Management System from a **blue theme** to a **green + white** theme, fix table layouts, add missing back buttons, improve hover effects, and add sidebar active-link highlighting — **without changing any component structure/logic**.

## Summary of Changes

| Issue | Fix |
|---|---|
| Blue theme everywhere | Switch to **green** (`#16a34a` / `#22c55e` / `#DCFCE7`) palette |
| Tables not fitting properly | Add `table-layout: fixed`, proper `width: 100%`, overflow wrappers, consistent cell padding |
| Missing back buttons | Add `← Back` on pages: **Surgical Procedure**, **Lab Test**, **Test Resources** |
| No hover color on table rows / buttons | Add `:hover` backgrounds across all tables & interactive elements |
| No `active` class on sidebar | Add `useLocation` check in `App.jsx` to apply `.app-links--active` |
| Inconsistent styling | Unify button colors, input focus rings, card borders to green |

---

## Proposed Changes

### Global Design Tokens

#### [MODIFY] [index.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/index.css)
- Change CSS variables from blue to green palette:
  - `--primary: #22c55e` (green-500)
  - `--primary-dark: #16a34a` (green-600)
  - `--primary-light: #DCFCE7` (green-100)
  - `--surface: #ffffff` (keep white)
  - `--surface-alt: #f8faf9` (subtle green-tinted white)
- Body background stays light (`#f0f4f3` green-tinted neutral)

---

### Navigation & Sidebar

#### [MODIFY] [App.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/App.css)
- Top nav gradient → green: `linear-gradient(135deg, #16a34a, #22c55e)`
- Box-shadow → green tint
- Add `.app-links--active` style (green background, dark green text, left border accent)
- Sidebar hover → green tint

#### [MODIFY] [App.jsx](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/App.jsx)
- Import `useLocation` from react-router-dom
- Compute `pathname` from location
- Apply `app-links--active` class conditionally on sidebar links using `pathname.startsWith()` matching

---

### Login Page

#### [MODIFY] [Login.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/Login.css)
- Background gradient → green
- Button gradient → green
- Input focus ring → green
- Box-shadow → green tint

---

### All Table Pages (fix fit + hover rows)

#### [MODIFY] [all_patient.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/all_patient.css)
- Table header → green (`#16a34a`)
- Row hover → `#DCFCE7` (green-100)
- Active row → green tint
- Add `table-layout: fixed` + overflow wrapper
- Back button hover → green

#### [MODIFY] [booking_history.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/booking_history.css)
- Table header → green
- Row hover → green tint
- Add `table-layout: fixed` for proper fitting
- Back button hover → green
- Remove inline `border="1"` attribute from table in JSX

#### [MODIFY] [booking_history.jsx](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/booking_history.jsx)
- Remove `border="1"` from `<table>` (handled in CSS)

---

### Card Pages (Patient, Booking)

#### [MODIFY] [patient.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/patient.css)
- Card hover border → green
- Card hover text → green

#### [MODIFY] [booking.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/booking.css)
- Card hover border → green
- Card hover text → green

---

### Form Pages (Add Patient, Booking Patient, Payment)

#### [MODIFY] [add_patient.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/add_patient.css)
- Input focus → green ring
- Submit button → green
- Back button → green

#### [MODIFY] [booking_patient.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/booking_patient.css)
- Input focus → green ring
- Submit button → green
- Doctor suggestions hover → green
- Back button → green

#### [MODIFY] [payment.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/payment.css)
- Input focus → green ring
- Pay button → green
- Checkbox accent → green
- Total amount highlight → green
- Back button → green

---

### Doctor Flow (Consulting, Dashboard, Prescription, Feedback, Lab Test)

#### [MODIFY] [consulting.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/consulting.css)
- Row hover → green tint
- Active row → green
- Age badge → green
- Action buttons hover → green

#### [MODIFY] [patient_dashboard.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/patient_dashboard.css)
- Badge → green
- Detail buttons → green
- Action buttons hover → green
- Back button → green

#### [MODIFY] [prescription.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/prescription.css)
- Legend → green
- Input focus → green
- Submit button → green
- Back button → green

#### [MODIFY] [feedback.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/feedback.css)
- Recipient text → green
- Input focus → green
- Send button → green
- Back button → green

#### [MODIFY] [lab_test.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/lab_test.css)
- Avatar → green
- View button → green
- Spinner → green
- Card hover → green

#### [MODIFY] [lab_test.jsx](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/lab_test.jsx)
- Add `← Back` button (navigate to dashboard) in header

---

### MLT Flow (Testing Patient, Test Resources)

#### [MODIFY] [Testing_Patient.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/Testing_Patient.css)
- Header row → green gradient
- Row hover → green tint
- Active row → green
- Age badge → green gradient

#### [MODIFY] [test_resources.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/test_resources.css)
- Submit button → green
- Input focus → green

#### [MODIFY] [test_resources.jsx](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/test_resources.jsx)
- Add `← Back` button (navigate to `/patient_test`)

---

### Surgical Procedure

#### [MODIFY] [surgical_procedure.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/surgical_procedure.css)
- All blue references → green
- Patient panel → green-tinted
- Buttons → green
- Focus → green

#### [MODIFY] [surgical_procedure.jsx](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/mini_pages/surgical_procedure.jsx)
- Add `← Back` button (navigate to dashboard)

---

### Home Page

#### [MODIFY] [home.css](file:///c:/Users/MG-PC/Works/Nuzoviya-medical-platform/frontend/src/main_pages/home.css)
- Review card avatar border → green

---

## What Won't Change
- No component structure or JSX hierarchy changes (only CSS + minimal JSX for back buttons and active class)
- No backend API changes
- No routing changes
- No new dependencies

## Verification Plan

### Manual Verification
- Run `npm run dev` and visually check every page
- Confirm green theme across all pages
- Check back buttons are present and navigate correctly
- Verify table rows fit properly with no overflow
- Confirm hover effects on all interactive elements
- Confirm active sidebar link highlights correctly
