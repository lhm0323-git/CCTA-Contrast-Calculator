# CCTA Contrast Dose Calculator - Agent Handoff Document

This document serves as a technical handoff for the next AI coding agent or developer working on this project. It outlines what has been built, the current mathematical models, safety gates, and the roadmap for next steps.

---

## 📋 Project Overview
A premium, web-based CCTA (Coronary Computed Tomography Angiography) contrast dose and injection rate calculator tailored for clinical radiology staff.
- **Goal:** Optimize contrast medium volume and injection flow rate for patients undergoing CCTA scans (optimized for **Somatom Force** scanners).
- **Core Principle:** Simple clinical workflow (only Sex, Height, Weight, and Heart Rate are required) with automated safety and quality checks.

---

## 📂 File Structure & Locations
All files are located in: `f:/github/ccta contrast/`

1. **[index.html](file:///f:/github/ccta%20contrast/index.html)** — The main user interface. Built with semantic HTML5, Lucide Icons, and responsive sections. Uses standard classic script inclusion `<script src="app.js">` to prevent CORS issues.
2. **[style.css](file:///f:/github/ccta%20contrast/style.css)** — Glassmorphism UI styles, CSS custom properties for dark/light themes, pulsing heart animations, scanning lasers, and responsive breakpoints.
3. **[app.js](file:///f:/github/ccta%20contrast/app.js)** — The combined controller, mock database, and calculation engine. Bundles everything to facilitate direct execution on file double-clicks without CORS blockers.
4. **[his-mock-db.js](file:///f:/github/ccta%20contrast/his-mock-db.js)** — Legacy database file (logic moved to `app.js` to enable local offline opening, contains documentation header).
5. **[README.md](file:///f:/github/ccta%20contrast/README.md)** — Detailed user guide with mathematical formulas and launch commands.
6. **[spec.md](file:///f:/github/ccta%20contrast/spec.md)** — Project specification and validation metrics.

---

## ⚙️ Core Clinical Logic & Formulas

### 1. Iodine Load Calculation (Weight-Based Default)
- **Formula:**
  $$\text{Total Iodine (mg)} = \text{Weight (kg)} \times \text{Weight Coef (mg I/kg)} \times \text{Voltage Multiplier}$$
  - *Weight Coefficient:* Default **270 mg I/kg** (adjustable in advanced settings).
  - *Voltage Multiplier (based on Somatom Force kVp):*
    - **70 kVp:** 0.8
    - **80 kVp (Standard default):** 1.0
    - **100 kVp:** 1.2
    - **120 kVp:** 1.4

### 2. Contrast Volume (mL) & Clinical Rounding (5 cc steps)
- **Formula:**
  $$\text{Raw Volume (mL)} = \frac{\text{Total Iodine (mg)}}{\text{Contrast Conc (mg/mL)}}$$
  - *Contrast Concentrations:* Xenetix 350 (**350 mg I/mL**) or Iopamiro 370 (**370 mg I/mL**).
- **Rounding:** Rounded to the nearest **5 cc** step (minimum clamp: **20 cc**).
  $$\text{Rounded Volume} = \text{Round}_{5}(\text{Raw Volume})$$

### 3. Heart Rate Injection Time Adaptor (Duration)
If not manually overridden by the advanced settings duration slider, the target injection duration automatically adapts to the patient's heart rate:
- **HR < 65 bpm:** Duration = **12.0 seconds** (Normal rate, displays green status banner).
- **65 <= HR <= 75 bpm:** Duration = **11.0 seconds** (Fast rate, displays orange banner, heart icon pulses).
- **HR > 75 bpm:** Duration = **10.0 seconds** (Very fast rate, displays red banner, heart pulses rapidly).

### 4. Injection Flow Rate (mL/s) & Clinical Rounding (0.5 mL/s steps)
- **Formula:**
  $$\text{Raw Flow Rate (mL/s)} = \frac{\text{Rounded Volume (mL)}}{\text{Target Duration (seconds)}}$$
- **Rounding:** Rounded to the nearest **0.5 mL/s** step (minimum clamp: **1.0 mL/s**).
  $$\text{Rounded Flow Rate} = \text{Round}_{0.5}(\text{Raw Flow Rate})$$

### 5. Final Output Calculations (SOP Card)
- **Actual Injection Time:** Calculated back from the rounded parameters:
  $$\text{Actual Time (seconds)} = \frac{\text{Rounded Volume (mL)}}{\text{Rounded Flow Rate (mL/s)}}$$
- **Actual Iodine Delivery Rate (IDR):**
  $$\text{Actual IDR (g I/s)} = \frac{\text{Rounded Flow Rate (mL/s)} \times \text{Concentration (mg/mL)}}{1000}$$
  - IDR ranges: **1.4 to 1.8 g/s** (Green: optimal quality), **< 1.4 g/s** (Orange: potential under-contrast), **> 1.8 g/s** (Orange: potential over-pressure).
- **B-syringe Saline Flush:** Volume is user-customizable (default **35 cc**), injected at the same flow rate as the contrast agent.

### 6. eGFR Safety Gate Lockouts
- **eGFR >= 45:** Safe (Green card).
- **30 <= eGFR < 45:** Mild impairment warning (Orange card, hydration warning).
- **eGFR < 30:** Severe renal impairment (Red card).
  - **Locks all calculations.** The outputs card is covered by a blurred lock screen.
  - **Unlock mechanism:** Enter Physician Name and Unlock Reason in the clinical override form to clear the lock. Log is added to the "覆核與操作歷史紀錄" audit trail.

---

## ⚡ Verification & Direct Opening Compatibility
A crucial feature is **CORS-Free execution**. Since modern browsers block module imports when opening files using the `file:///` protocol (e.g. double-clicking `index.html`), the application was bundled:
- **All JavaScript logic (including mock data) lives inside `app.js`.**
- Imported via a standard script tag: `<script src="app.js"></script>` (without `type="module"`).
- Double-clicking `index.html` in Windows Explorer runs the calculator instantly with all calculations pre-updating properly.

---

## 🚀 Tasks for the Next Agent/Developer Session

When continuing tomorrow at the hospital, you may want to focus on:
1. **Clinical Feedback Integration:** Validate if the 5 cc dose increments and 0.5 cc/s flow rate increments align perfectly with the high-pressure injectors used in their ward.
2. **HIS API Integration (Stage 2):** Hook up the scanning inputs with the actual hospital HIS barcode query system. Look for the `fetchPatientFromHIS(barcodeId)` function in `app.js` and replace the simulated Promise delay with a real fetch request to the hospital's endpoint.
3. **Scan Voltage calibration:** Check if the multipliers (0.8 for 70 kVp, 1.2 for 100 kVp, 1.4 for 120 kVp) need fine-tuning based on the radiologists' preferences.
