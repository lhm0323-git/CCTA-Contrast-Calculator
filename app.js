// ==========================================================================
// Mock HIS Patient Database (Local Bundle for Offline / Direct File access)
// ==========================================================================
const mockHISDatabase = {
  "PAT-001": {
    id: "PAT-001",
    name: "張志明",
    gender: "male",
    height: 172,
    weight: 68,
    egfr: 85,
    hr: 60,
    description: "標準體態受試者 (Normal)"
  },
  "PAT-002": {
    id: "PAT-002",
    name: "林春嬌",
    gender: "female",
    height: 158,
    weight: 76,
    egfr: 52,
    hr: 72,
    description: "輕度肥胖、心跳偏快受試者 (Obese, eGFR Borderline)"
  },
  "PAT-003": {
    id: "PAT-003",
    name: "王大同",
    gender: "male",
    height: 180,
    weight: 92,
    egfr: 38,
    hr: 80,
    description: "高體重、心跳過快受試者 (High Weight, eGFR Stage 3b)"
  },
  "PAT-004": {
    id: "PAT-004",
    name: "陳淑芬",
    gender: "female",
    height: 152,
    weight: 48,
    egfr: 22,
    hr: 62,
    description: "極高風險重度腎功能不全受試者 (Severe Renal Impairment, eGFR < 30)"
  },
  "PAT-005": {
    id: "PAT-005",
    name: "李國華",
    gender: "male",
    height: 175,
    weight: 82,
    egfr: 65,
    hr: 76,
    description: "心跳偏快、中度腎功能低下受試者"
  }
};

/**
 * Simulates fetching patient record from HIS API.
 */
function fetchPatientFromHIS(patientId) {
  return new Promise((resolve, reject) => {
    const formattedId = patientId.trim().toUpperCase();
    setTimeout(() => {
      const patient = mockHISDatabase[formattedId];
      if (patient) {
        resolve(JSON.parse(JSON.stringify(patient)));
      } else {
        reject(new Error(`HIS API Error: 查無此受試者條碼 ID [ ${formattedId} ]。`));
      }
    }, 750); // Simulated delay
  });
}

// ==========================================================================
// Application State
// ==========================================================================
const state = {
  currentPatientId: "",
  patientName: "請輸入姓名",
  gender: "male", // 'male' | 'female'
  height: 172, // cm
  weight: 68, // kg
  hr: 60, // bpm
  egfr: 90,
  
  // Custom coefficients (adjustable in advanced settings)
  voltageMultiplier: 1.0, // Multiplier for kVp setting
  weightCoefficient: 270, // mg I / kg Weight
  injectionDuration: 12.0, // seconds
  salineVolume: 35, // cc
  
  contrastConcentration: 370, // mg/mL
  calculationBasis: "weight", // Default to weight-based
  
  isOverrideActive: false,
  isScanning: false,
  isDurationManuallyOverridden: false,
  isFlowRateManuallyOverridden: false,
  manualFlowRate: 4.0,
  theme: "dark"
};

// ==========================================================================
// DOM Elements Cache
// ==========================================================================
const DOM = {
  // Theme Toggle
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  
  // Accordions Triggers
  egfrAccordionTrigger: document.getElementById("egfrAccordionTrigger"),
  hisAccordionTrigger: document.getElementById("hisAccordionTrigger"),
  settingsAccordionTrigger: document.getElementById("settingsAccordionTrigger"),
  auditAccordionTrigger: document.getElementById("auditAccordionTrigger"),
  
  // Accordions Panels
  egfrAccordion: document.getElementById("egfrAccordionTrigger").closest(".accordion"),
  hisAccordion: document.getElementById("hisAccordionTrigger").closest(".accordion"),
  settingsAccordion: document.getElementById("settingsAccordionTrigger").closest(".accordion"),
  auditAccordion: document.getElementById("auditAccordionTrigger").closest(".accordion"),

  // Core Inputs
  genderMale: document.getElementById("genderMale"),
  genderFemale: document.getElementById("genderFemale"),
  height: document.getElementById("height"),
  weight: document.getElementById("weight"),
  hr: document.getElementById("hr"),
  hrStatusInfo: document.getElementById("hrStatusInfo"),
  hrStatusMsg: document.getElementById("hrStatusMsg"),
  
  // Advanced Inputs
  egfr: document.getElementById("egfr"),
  contrastSelect: document.getElementById("contrastSelect"),
  scanVoltage: document.getElementById("scanVoltage"),
  
  weightCoefSlider: document.getElementById("weightCoefSlider"),
  weightCoefVal: document.getElementById("weightCoefVal"),
  injectDurationSlider: document.getElementById("injectDurationSlider"),
  injectDurationVal: document.getElementById("injectDurationVal"),
  injectFlowRateSlider: document.getElementById("injectFlowRateSlider"),
  injectFlowRateVal: document.getElementById("injectFlowRateVal"),
  salineVolumeSlider: document.getElementById("salineVolumeSlider"),
  salineVolumeVal: document.getElementById("salineVolumeVal"),

  // Scanner Simulator
  laserLine: document.getElementById("laserLine"),
  barcodeInput: document.getElementById("barcodeInput"),
  scanBtn: document.getElementById("scanBtn"),
  scanStatus: document.getElementById("scanStatus"),
  manualIndicator: document.getElementById("manualIndicator"),
  presetChips: document.querySelectorAll(".preset-chip"),
  patientId: document.getElementById("patientId"),
  patientName: document.getElementById("patientName"),

  // Intermediate values
  miniBmi: document.getElementById("miniBmi"),
  miniWeight: document.getElementById("miniWeight"),
  miniIodine: document.getElementById("miniIodine"),

  // Safety Gates (eGFR)
  egfrCard: document.getElementById("egfrCard"),
  egfrValueBadge: document.getElementById("egfrValueBadge"),
  egfrMessage: document.getElementById("egfrMessage"),
  overrideContainer: document.getElementById("overrideContainer"),
  overridePhysician: document.getElementById("overridePhysician"),
  overrideReason: document.getElementById("overrideReason"),
  overrideSubmitBtn: document.getElementById("overrideSubmitBtn"),

  // Outputs
  outputPanel: document.getElementById("outputPanel"),
  lockOverlay: document.getElementById("lockOverlay"),
  lockOverlayMessage: document.getElementById("lockOverlayMessage"),
  outVolume: document.getElementById("outVolume"),
  outFlowRate: document.getElementById("outFlowRate"),
  outSaline: document.getElementById("outSaline"),
  outSalineFlowRate: document.getElementById("outSalineFlowRate"),
  outDuration: document.getElementById("outDuration"),
  durationBadge: document.getElementById("durationBadge"),
  outIdr: document.getElementById("outIdr"),
  idrBadge: document.getElementById("idrBadge"),
  obesityPanel: document.getElementById("obesityPanel"),
  obesityComparison: document.getElementById("obesityComparison"),
  
  // History logs
  auditList: document.getElementById("auditList")
};

// ==========================================================================
// Clinical Core Calculations (Pure Functions)
// ==========================================================================

function calculateBMI(weight, heightCm) {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function getVoltageFactor(kvp) {
  switch (parseInt(kvp)) {
    case 70: return 0.8;
    case 80: return 1.0;
    case 100: return 1.2;
    case 120: return 1.4;
    default: return 1.0;
  }
}

function calculateLBM(gender, weight, height) {
  const val = gender === "male" 
    ? (0.32810 * weight + 0.33929 * height - 29.5336)
    : (0.29569 * weight + 0.41813 * height - 43.2933);
  return Math.max(val, 0);
}

function calculateIBW(gender, heightCm) {
  const heightInches = heightCm / 2.54;
  const val = gender === "male"
    ? (50.0 + 2.3 * (heightInches - 60))
    : (45.5 + 2.3 * (heightInches - 60));
  return Math.max(val, 0);
}

function calculateAdjBW(gender, weight, heightCm) {
  const lbm = calculateLBM(gender, weight, heightCm);
  if (weight > lbm) {
    return lbm + 0.4 * (weight - lbm);
  }
  return lbm;
}

function getIDRRange(kvp) {
  switch (parseInt(kvp)) {
    case 70: return { min: 1.2, max: 1.5 };
    case 80: return { min: 1.4, max: 1.7 };
    case 100: return { min: 1.6, max: 1.9 };
    case 120: return { min: 1.8, max: 2.2 };
    default: return { min: 1.4, max: 1.8 };
  }
}

// ==========================================================================
// Main Calculation Orchestrator & UI Renderer
// ==========================================================================
function updateCalculations() {
  // 1. Read values from inputs
  const weight = parseFloat(DOM.weight.value) || 0;
  const height = parseFloat(DOM.height.value) || 0;
  const hr = parseFloat(DOM.hr.value) || 60;
  const egfr = parseFloat(DOM.egfr.value) || 90; // Default eGFR to 90 if empty/invalid
  const contrastConc = parseInt(DOM.contrastSelect.value) || 370;
  const scanKvp = parseInt(DOM.scanVoltage.value) || 80;
  
  // Update state parameters
  state.weight = weight;
  state.height = height;
  state.hr = hr;
  state.egfr = egfr;
  state.contrastConcentration = contrastConc;
  state.voltageMultiplier = getVoltageFactor(scanKvp);

  // 2. Perform Calculations
  const bmi = calculateBMI(weight, height);

  // Calculate LBM & AdjBW
  const lbm = calculateLBM(state.gender, weight, height);
  const adjbw = calculateAdjBW(state.gender, weight, height);

  // Check if patient is overweight/obese (BMI >= 25)
  const isObeseOrOverweight = (bmi >= 25.0);
  const calculationWeight = isObeseOrOverweight ? adjbw : weight;

  // Target iodine load based on selected weight basis (TBW or ABW)
  const iodineLoadWeightMg = calculationWeight * state.weightCoefficient * state.voltageMultiplier;

  // Calculate Contrast Volume (rounded to nearest 5 cc, min 20 cc)
  let rawContrastVolume = iodineLoadWeightMg / contrastConc;
  if (rawContrastVolume < 0 || isNaN(rawContrastVolume)) rawContrastVolume = 0;

  let contrastVolume = Math.round(rawContrastVolume / 5) * 5;
  if (rawContrastVolume > 0 && contrastVolume < 20) {
    contrastVolume = 20; // Clinical minimum safe threshold
  }
  if (rawContrastVolume === 0) {
    contrastVolume = 0;
  }

  // Obesity Cap: BMI > 35 caps dose to 75cc
  let isMorbidObesityCapApplied = false;
  if (bmi > 35 && contrastVolume > 75) {
    contrastVolume = 75;
    isMorbidObesityCapApplied = true;
  }

  // Calculate comparative doses for rendering
  const rawTbwVolume = weight * state.weightCoefficient * state.voltageMultiplier / contrastConc;
  let tbwVolume = Math.round(rawTbwVolume / 5) * 5;
  if (rawTbwVolume > 0 && tbwVolume < 20) tbwVolume = 20;
  if (rawTbwVolume <= 0) tbwVolume = 0;

  const rawLbmVolume = lbm * state.weightCoefficient * state.voltageMultiplier / contrastConc;
  let lbmVolume = Math.round(rawLbmVolume / 5) * 5;
  if (rawLbmVolume > 0 && lbmVolume < 20) lbmVolume = 20;
  if (rawLbmVolume <= 0) lbmVolume = 0;

  const rawAdjVolume = adjbw * state.weightCoefficient * state.voltageMultiplier / contrastConc;
  let adjVolume = Math.round(rawAdjVolume / 5) * 5;
  if (rawAdjVolume > 0 && adjVolume < 20) adjVolume = 20;
  if (rawAdjVolume <= 0) adjVolume = 0;

  // 3. Flow Rate and Injection Duration Calculations
  const idrRange = getIDRRange(scanKvp);
  const maxFlowRate = Math.floor((idrRange.max * 1000 / contrastConc) * 10) / 10;
  
  let flowRate = 0;
  let isFlowRateClamped = false;
  
  if (state.isFlowRateManuallyOverridden) {
    // Flow rate manual override
    flowRate = state.manualFlowRate;
    
    if (flowRate > maxFlowRate) {
      flowRate = maxFlowRate;
      isFlowRateClamped = true;
    }
    
    state.injectionDuration = flowRate > 0 ? (contrastVolume / flowRate) : 12.0;

    DOM.hrStatusMsg.textContent = isFlowRateClamped 
      ? `已達到安全流速上限 ${maxFlowRate.toFixed(1)} mL/s (原設定 ${state.manualFlowRate.toFixed(1)} mL/s 觸發 IDR 限制)`
      : `已手動調整注射流速為 ${flowRate.toFixed(1)} mL/s (覆蓋預設計算流速)`;
    DOM.hrStatusInfo.className = isFlowRateClamped ? `hr-status-info fast` : `hr-status-info normal`;

    // Sync UI Sliders
    DOM.injectDurationSlider.value = Math.min(Math.max(state.injectionDuration, 8.0), 16.0);
    DOM.injectDurationVal.textContent = `${state.injectionDuration.toFixed(1)}s`;
    DOM.injectFlowRateSlider.value = flowRate;
    DOM.injectFlowRateVal.textContent = `${flowRate.toFixed(1)} mL/s`;
  } else if (state.isDurationManuallyOverridden) {
    // Duration manual override
    const manualDuration = parseFloat(DOM.injectDurationSlider.value);
    state.injectionDuration = manualDuration;

    const rawFlowRate = contrastVolume / state.injectionDuration;
    flowRate = Math.round(rawFlowRate / 0.5) * 0.5;
    if (rawFlowRate > 0 && flowRate < 1.0) flowRate = 1.0;
    if (rawFlowRate === 0) flowRate = 0;

    if (flowRate > maxFlowRate) {
      flowRate = maxFlowRate;
      isFlowRateClamped = true;
      state.injectionDuration = flowRate > 0 ? (contrastVolume / flowRate) : manualDuration;
    }

    DOM.hrStatusMsg.textContent = isFlowRateClamped 
      ? `已達到安全流速上限 ${maxFlowRate.toFixed(1)} mL/s (原設定時間 ${manualDuration.toFixed(1)}s 觸發 IDR 限制)`
      : `已手動調整注射時間為 ${manualDuration.toFixed(1)} 秒 (覆蓋心率預設)`;
    DOM.hrStatusInfo.className = isFlowRateClamped ? `hr-status-info fast` : `hr-status-info normal`;

    // Sync UI Sliders
    DOM.injectDurationSlider.value = Math.min(Math.max(state.injectionDuration, 8.0), 16.0);
    DOM.injectDurationVal.textContent = `${state.injectionDuration.toFixed(1)}s`;
    DOM.injectFlowRateSlider.value = Math.min(Math.max(flowRate, 1.0), 8.0);
    DOM.injectFlowRateVal.textContent = `${flowRate.toFixed(1)} mL/s`;
  } else {
    // Heart rate automatic adaptation
    let duration = 12.0;
    let hrClass = "normal";
    let hrMessage = "心跳正常 (常規 12 秒注射)";
    
    if (hr >= 65 && hr <= 75) {
      duration = 11.0;
      hrClass = "fast";
      hrMessage = "心跳偏快 (自動調整為 11 秒注射，增加前沿對比)";
    } else if (hr > 75) {
      duration = 10.0;
      hrClass = "very-fast";
      hrMessage = "心跳過快 (自動調整為 10 秒注射，強化團注濃度)";
    }
    
    state.injectionDuration = duration;

    const rawFlowRate = contrastVolume / duration;
    flowRate = Math.round(rawFlowRate / 0.5) * 0.5;
    if (rawFlowRate > 0 && flowRate < 1.0) flowRate = 1.0;
    if (rawFlowRate === 0) flowRate = 0;

    if (flowRate > maxFlowRate) {
      flowRate = maxFlowRate;
      isFlowRateClamped = true;
      state.injectionDuration = flowRate > 0 ? (contrastVolume / flowRate) : duration;
    }

    DOM.hrStatusMsg.textContent = isFlowRateClamped 
      ? `已自動卡控安全流速上限 ${maxFlowRate.toFixed(1)} mL/s (防爆血管/降壓協定)`
      : hrMessage;
    DOM.hrStatusInfo.className = isFlowRateClamped ? `hr-status-info fast` : `hr-status-info ${hrClass}`;

    // Sync UI Sliders
    DOM.injectDurationSlider.value = Math.min(Math.max(state.injectionDuration, 8.0), 16.0);
    DOM.injectDurationVal.textContent = `${state.injectionDuration.toFixed(1)}s`;
    DOM.injectFlowRateSlider.value = Math.min(Math.max(flowRate, 1.0), 8.0);
    DOM.injectFlowRateVal.textContent = `${flowRate.toFixed(1)} mL/s`;
  }

  // 4. Update intermediate UI values (in Advanced drawer)
  DOM.miniBmi.textContent = bmi > 0 ? bmi.toFixed(1) : "0.0";
  DOM.miniWeight.textContent = weight.toFixed(1);
  DOM.miniIodine.textContent = (iodineLoadWeightMg / 1000).toFixed(2); // Convert to grams

  // 5. Clinical eGFR Safety Card Check
  let egfrState = "safe"; // 'safe' | 'warn' | 'danger'
  let egfrMessageText = "";

  if (egfr >= 45) {
    egfrState = "safe";
    egfrMessageText = "腎功能正常 (eGFR ≧ 45)。允許執行常規 CCTA 顯影劑劑量注入協定。";
    DOM.overrideContainer.style.display = "none";
  } else if (egfr >= 30 && egfr < 45) {
    egfrState = "warn";
    egfrMessageText = "⚠️ 警告：腎功能輕度受損 (eGFR 30–44，Stage 3)。建議限制注射流速，加強水份灌注，並建議於造影後 48-72 小時追蹤血清肌酸酐值。";
    DOM.overrideContainer.style.display = "none";
  } else {
    egfrState = "danger";
    egfrMessageText = "🚨 警告：受試者 eGFR 小於 30，屬重度腎臟功能不全。為防止造影劑腎病變 (CIN)，劑量計算已自動鎖定。";
    
    // Toggle manual override form based on whether it is already active
    if (!state.isOverrideActive) {
      DOM.overrideContainer.style.display = "flex";
    } else {
      DOM.overrideContainer.style.display = "none";
      egfrMessageText += " [已由授權醫師覆核解鎖]";
    }
  }

  // Render eGFR card classes
  DOM.egfrCard.className = `egfr-indicator-card ${egfrState}`;
  DOM.egfrValueBadge.textContent = `eGFR: ${egfr > 0 ? egfr : "N/A"}`;
  DOM.egfrMessage.textContent = egfrMessageText;

  // 6. Apply Safe Gate Lockout
  const isLocked = (egfrState === "danger" && !state.isOverrideActive);
  if (isLocked) {
    DOM.lockOverlay.classList.add("active");
    DOM.outputPanel.classList.add("locked");
    
    // Reset output text display
    DOM.outVolume.textContent = "0";
    DOM.outFlowRate.textContent = "0.0";
    DOM.outSalineFlowRate.textContent = "0.0";
    DOM.outDuration.textContent = "0.0";
    DOM.outIdr.textContent = "0.00";
    DOM.idrBadge.textContent = "LOCKED";
    DOM.idrBadge.className = "idr-badge warn";
    DOM.durationBadge.textContent = "LOCKED";
    DOM.durationBadge.className = "idr-badge warn";
    DOM.obesityPanel.style.display = "none";
    return; // Stop rendering final results
  } else {
    DOM.lockOverlay.classList.remove("active");
    DOM.outputPanel.classList.remove("locked");
  }

  // Calculate actual duration based on rounded values
  const actualDuration = flowRate > 0 ? contrastVolume / flowRate : 0;

  // Actual Iodine Delivery Rate (IDR, g I/s) based on rounded flow rate
  const idr = (flowRate * contrastConc) / 1000;

  // 8. Update Outputs on Card
  DOM.outVolume.textContent = contrastVolume.toFixed(0); // Display rounded volume as integer (e.g., 50)
  DOM.outFlowRate.textContent = flowRate.toFixed(1); // Display rounded flow rate to nearest 0.5 (e.g. 4.0)
  
  DOM.outSaline.textContent = state.salineVolume;
  DOM.outSalineFlowRate.textContent = flowRate.toFixed(1);
  DOM.outDuration.textContent = actualDuration.toFixed(1);
  
  DOM.outIdr.textContent = idr.toFixed(2);

  // Dynamic IDR Bounds check
  if (isFlowRateClamped) {
    DOM.idrBadge.textContent = `安全限流中 (${idr.toFixed(2)} g I/s)`;
    DOM.idrBadge.className = "idr-badge warn";
  } else if (idr >= idrRange.min && idr <= idrRange.max) {
    DOM.idrBadge.textContent = `對比度極佳 (${idrRange.min.toFixed(1)}-${idrRange.max.toFixed(1)} g/s)`;
    DOM.idrBadge.className = "idr-badge safe";
  } else if (idr < idrRange.min) {
    DOM.idrBadge.textContent = `對比度可能不足 (<${idrRange.min.toFixed(1)} g/s)`;
    DOM.idrBadge.className = "idr-badge warn";
  } else {
    DOM.idrBadge.textContent = `流速過高 / 壓力偏高 (>${idrRange.max.toFixed(1)} g/s)`;
    DOM.idrBadge.className = "idr-badge warn";
  }

  // Target Injection Duration Check
  if (actualDuration < 10.0) {
    DOM.durationBadge.textContent = "過短 (掃描匹配警告)";
    DOM.durationBadge.className = "idr-badge warn";
  } else if (actualDuration >= 10.0 && actualDuration <= 14.0) {
    DOM.durationBadge.textContent = "常用合理區間";
    DOM.durationBadge.className = "idr-badge safe";
  } else if (actualDuration > 14.0 && actualDuration <= 16.0) {
    DOM.durationBadge.textContent = "一般正常";
    DOM.durationBadge.className = "idr-badge safe";
  } else {
    DOM.durationBadge.textContent = "過長 (峰值變鈍警告)";
    DOM.durationBadge.className = "idr-badge warn";
  }

  // 9. Display Obesity & Body Build Reference Panel
  if (weight > 0) {
    if (bmi < 18.5) {
      DOM.obesityPanel.style.display = "block";
      DOM.obesityComparison.innerHTML = `<div style="color: var(--color-warn); font-weight: 600;">⚠️ 體重過輕提示：已自動套用臨床最小安全劑量 20 mL。</div>`;
    } else if (bmi >= 25) {
      DOM.obesityPanel.style.display = "block";
      DOM.obesityComparison.innerHTML = `
        <div style="color: var(--color-warn); font-weight: 600; margin-bottom: 0.2rem;">⚖️ 已套用脂肪校正體重 (ABW) 進行劑量計算，以取得對比與造影安全平衡</div>
        <div>• 依總體重 (TBW) 基準：<strong>${tbwVolume} mL</strong> ${isMorbidObesityCapApplied ? '<span style="color: var(--color-danger);">(已限制於 75 mL 上限)</span>' : ''}</div>
        <div>• 依去脂體重 (LBM) 基準：<strong>${lbmVolume} mL</strong></div>
        <div style="margin-top: 0.15rem; color: var(--color-safe);">• <strong>校正體重 (ABW) 建議：${adjVolume} mL (已採用)</strong></div>
        ${isMorbidObesityCapApplied ? '<div style="margin-top: 0.25rem; font-weight: 500; color: var(--color-warn);">🚨 極度肥胖：劑量已限制於安全上限 75 mL，請於造影中加強 HU 品質追蹤。</div>' : ''}
      `;
    } else {
      DOM.obesityPanel.style.display = "none";
    }
  } else {
    DOM.obesityPanel.style.display = "none";
  }
}

// ==========================================================================
// Log Override Event to History Audit
// ==========================================================================
function addAuditLog(patientName, patientId, egfr, physician, reason) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("zh-TW", { hour12: false });
  
  // If first log, clear placeholder
  if (DOM.auditList.textContent.includes("暫無覆核紀錄")) {
    DOM.auditList.innerHTML = "";
  }
  
  const logDiv = document.createElement("div");
  logDiv.className = "audit-item";
  logDiv.innerHTML = `
    <span class="audit-time">[${timeStr}]</span>
    <span class="audit-msg">受試者 ${patientName} (${patientId}, eGFR: ${egfr}) 已由 <strong>${physician}</strong> 解鎖。原因: ${reason}</span>
  `;
  
  DOM.auditList.insertBefore(logDiv, DOM.auditList.firstChild);
}

// ==========================================================================
// Simulation and API Fetch Loader
// ==========================================================================
function loadPatientData(patient) {
  state.currentPatientId = patient.id;
  state.patientName = patient.name;
  state.gender = patient.gender;
  state.height = patient.height;
  state.weight = patient.weight;
  state.hr = patient.hr || 60;
  state.egfr = patient.egfr;
  state.isOverrideActive = false; // Reset override on new patient load
  state.isDurationManuallyOverridden = false; // Reset manually overridden duration
  state.isFlowRateManuallyOverridden = false; // Reset manually overridden flow rate
  
  // Populate inputs in Form
  DOM.patientId.value = patient.id;
  DOM.patientName.value = patient.name;
  DOM.height.value = patient.height;
  DOM.weight.value = patient.weight;
  DOM.hr.value = patient.hr || 60;
  DOM.egfr.value = patient.egfr;

  // Toggle gender button classes
  if (patient.gender === "male") {
    DOM.genderMale.classList.add("active");
    DOM.genderFemale.classList.remove("active");
  } else {
    DOM.genderFemale.classList.add("active");
    DOM.genderMale.classList.remove("active");
  }

  // Clear manual indicator when fresh loaded
  DOM.manualIndicator.style.display = "none";
  DOM.scanStatus.innerHTML = `<i data-lucide="check-circle"></i> 成功載入受試者 [${patient.id} ${patient.name}] 資料。`;
  
  lucide.createIcons();
  updateCalculations();
}

/**
 * Triggers simulated barcode scanning
 */
function runBarcodeScan(barcodeId) {
  if (state.isScanning) return;
  
  state.isScanning = true;
  DOM.hisAccordion.classList.add("expanded"); // Force expand the panel when scanning
  const innerWrapper = DOM.hisAccordion.querySelector(".scanner-card-inner");
  innerWrapper.classList.add("scanning");
  DOM.scanStatus.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> 正在向 HIS API 請求受試者 [${barcodeId}] 資料...`;
  lucide.createIcons();

  fetchPatientFromHIS(barcodeId)
    .then((patient) => {
      loadPatientData(patient);
    })
    .catch((err) => {
      DOM.scanStatus.innerHTML = `<i data-lucide="alert-circle" style="color: var(--color-danger);"></i> ${err.message}`;
      lucide.createIcons();
    })
    .finally(() => {
      state.isScanning = false;
      innerWrapper.classList.remove("scanning");
    });
}

// ==========================================================================
// Setup Event Handlers
// ==========================================================================
function setupEventListeners() {
  
  // Theme toggle
  DOM.themeToggleBtn.addEventListener("click", () => {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute("data-theme");
    
    if (currentTheme === "dark") {
      htmlElement.setAttribute("data-theme", "light");
      DOM.themeToggleBtn.querySelector("span").textContent = "深色主題";
      DOM.themeToggleBtn.querySelector("i").setAttribute("data-lucide", "moon");
    } else {
      htmlElement.setAttribute("data-theme", "dark");
      DOM.themeToggleBtn.querySelector("span").textContent = "淺色主題";
      DOM.themeToggleBtn.querySelector("i").setAttribute("data-lucide", "sun");
    }
    lucide.createIcons();
  });

  // Accordion Toggles
  const accordions = [
    { trigger: DOM.egfrAccordionTrigger, panel: DOM.egfrAccordion },
    { trigger: DOM.hisAccordionTrigger, panel: DOM.hisAccordion },
    { trigger: DOM.settingsAccordionTrigger, panel: DOM.settingsAccordion },
    { trigger: DOM.auditAccordionTrigger, panel: DOM.auditAccordion }
  ];

  accordions.forEach(item => {
    item.trigger.addEventListener("click", () => {
      item.panel.classList.toggle("expanded");
    });
  });

  // Scanner actions
  DOM.scanBtn.addEventListener("click", () => {
    const id = DOM.barcodeInput.value.trim();
    if (id) {
      runBarcodeScan(id);
    }
  });

  DOM.barcodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const id = DOM.barcodeInput.value.trim();
      if (id) {
        runBarcodeScan(id);
      }
    }
  });

  // Preset chips clicking
  DOM.presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const patientId = chip.getAttribute("data-id");
      DOM.barcodeInput.value = patientId;
      runBarcodeScan(patientId);
    });
  });

  // Manual values input change event listeners
  const inputFields = [DOM.height, DOM.weight, DOM.hr, DOM.egfr, DOM.patientId, DOM.patientName];
  inputFields.forEach(input => {
    input.addEventListener("input", () => {
      DOM.manualIndicator.style.display = "inline-block";
      DOM.scanStatus.innerHTML = `<i data-lucide="edit-3"></i> 檢測到手動修改參數。`;
      
      // If heart rate is modified, reset override flags to let heart rate auto-adapt again
      if (input === DOM.hr) {
        state.isDurationManuallyOverridden = false;
        state.isFlowRateManuallyOverridden = false;
      }

      lucide.createIcons();
      updateCalculations();
    });
  });

  // Gender Buttons Handlers
  DOM.genderMale.addEventListener("click", () => {
    state.gender = "male";
    DOM.genderMale.classList.add("active");
    DOM.genderFemale.classList.remove("active");
    updateCalculations();
  });

  DOM.genderFemale.addEventListener("click", () => {
    state.gender = "female";
    DOM.genderFemale.classList.add("active");
    DOM.genderMale.classList.remove("active");
    updateCalculations();
  });

  // Contrast agent & Scan Voltage changes
  DOM.contrastSelect.addEventListener("change", updateCalculations);
  DOM.scanVoltage.addEventListener("change", () => {
    const kvp = parseInt(DOM.scanVoltage.value);
    if (kvp === 70 || kvp === 80) {
      state.weightCoefficient = 270;
    } else if (kvp === 100) {
      state.weightCoefficient = 300;
    } else if (kvp === 120) {
      state.weightCoefficient = 320;
    }
    // Sync slider value and label in UI
    DOM.weightCoefSlider.value = state.weightCoefficient;
    DOM.weightCoefVal.textContent = `${state.weightCoefficient} mg`;
    updateCalculations();
  });

  // Advanced setting sliders events
  DOM.weightCoefSlider.addEventListener("input", (e) => {
    state.weightCoefficient = parseInt(e.target.value);
    DOM.weightCoefVal.textContent = `${state.weightCoefficient} mg`;
    updateCalculations();
  });

  DOM.injectDurationSlider.addEventListener("input", (e) => {
    state.isDurationManuallyOverridden = true; // Mark as manually overridden
    state.isFlowRateManuallyOverridden = false; // Clear flow rate override
    state.injectionDuration = parseFloat(e.target.value);
    DOM.injectDurationVal.textContent = `${state.injectionDuration.toFixed(1)}s`;
    updateCalculations();
  });

  DOM.injectFlowRateSlider.addEventListener("input", (e) => {
    state.isFlowRateManuallyOverridden = true; // Mark as manually overridden
    state.isDurationManuallyOverridden = false; // Clear duration override
    state.manualFlowRate = parseFloat(e.target.value);
    DOM.injectFlowRateVal.textContent = `${state.manualFlowRate.toFixed(1)} mL/s`;
    updateCalculations();
  });

  DOM.salineVolumeSlider.addEventListener("input", (e) => {
    state.salineVolume = parseInt(e.target.value);
    DOM.salineVolumeVal.textContent = `${state.salineVolume} cc`;
    updateCalculations();
  });

  // Safety override submission handler
  DOM.overrideSubmitBtn.addEventListener("click", () => {
    const physician = DOM.overridePhysician.value.trim();
    const reason = DOM.overrideReason.value.trim();
    
    if (!physician || !reason) {
      alert("請完整填寫授權醫師姓名與解鎖原因，以符合醫療安全審計規範。");
      return;
    }

    state.isOverrideActive = true;
    const patId = DOM.patientId.value.trim() || "手動病歷";
    const patName = DOM.patientName.value.trim() || "無名受試者";
    
    addAuditLog(patName, patId, state.egfr, physician, reason);
    
    // Reset override fields
    DOM.overridePhysician.value = "";
    DOM.overrideReason.value = "";
    
    updateCalculations();
  });
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup Lucide icons
  lucide.createIcons();
  
  // 2. Setup standard default values in form inputs
  DOM.patientId.value = "PAT-001";
  DOM.patientName.value = "張志明";
  DOM.height.value = 172;
  DOM.weight.value = 68;
  DOM.hr.value = 60;
  DOM.egfr.value = 85;
  DOM.barcodeInput.value = "PAT-001";
  
  // 3. Setup listeners
  setupEventListeners();
  
  // 4. Initial calculations update
  updateCalculations();
});
