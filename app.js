/**
 * TipWise - Smart Tip & Bill Splitter Logic
 * Built as an AI Pair Programming Mini App with Cursor
 */

// State
const state = {
  currency: '$',
  billAmount: 0,
  tipPercent: 15,
  isCustomTip: false,
  splitCount: 1,
  roundUp: false,
  theme: localStorage.getItem('tipwise-theme') || 'dark',
};

// DOM Elements
const currencySelect = document.getElementById('currency-select');
const currPrefix = document.getElementById('curr-prefix');
const billInput = document.getElementById('bill-amount');
const tipChipsContainer = document.getElementById('tip-chips-container');
const tipChips = document.querySelectorAll('.tip-chip:not(.custom-trigger)');
const customTipChip = document.getElementById('custom-tip-chip');
const customTipContainer = document.getElementById('custom-tip-container');
const tipSlider = document.getElementById('tip-slider');
const customTipInput = document.getElementById('custom-tip-input');
const tipBadge = document.getElementById('tip-badge');

const splitInput = document.getElementById('split-count');
const splitDecrease = document.getElementById('split-decrease');
const splitIncrease = document.getElementById('split-increase');
const stepperUnitLabel = document.getElementById('stepper-unit-label');
const roundToggle = document.getElementById('round-toggle');
const resetBtn = document.getElementById('reset-btn');

const displayPerPerson = document.getElementById('display-per-person');
const displayTipPerPerson = document.getElementById('display-tip-per-person');
const displayBaseBill = document.getElementById('display-base-bill');
const displayTipRate = document.getElementById('display-tip-rate');
const displayTotalTip = document.getElementById('display-total-tip');
const displayTotalBill = document.getElementById('display-total-bill');

const barBill = document.getElementById('bar-bill');
const barTip = document.getElementById('bar-tip');
const ratioBillPct = document.getElementById('ratio-bill-pct');
const ratioTipPct = document.getElementById('ratio-tip-pct');

const copySummaryBtn = document.getElementById('copy-summary-btn');
const shareSummaryBtn = document.getElementById('share-summary-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

/**
 * Format currency amount
 */
function formatCurrency(amount) {
  return `${state.currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Show temporary toast message
 */
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toastMessage.textContent = message;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/**
 * Apply theme
 */
function applyTheme(theme) {
  state.theme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('tipwise-theme', theme);
}

/**
 * Recalculate totals and update UI
 */
function updateCalculations() {
  const baseBill = Math.max(0, parseFloat(billInput.value) || 0);
  state.billAmount = baseBill;

  let calculatedTip = (baseBill * state.tipPercent) / 100;
  let totalWithTip = baseBill + calculatedTip;

  if (state.roundUp && totalWithTip > 0) {
    const roundedTotal = Math.ceil(totalWithTip);
    calculatedTip = roundedTotal - baseBill;
    totalWithTip = roundedTotal;
  }

  const people = Math.max(1, state.splitCount);
  const perPersonTotal = totalWithTip / people;
  const perPersonTip = calculatedTip / people;

  // Render values
  displayPerPerson.textContent = formatCurrency(perPersonTotal);
  displayTipPerPerson.textContent = formatCurrency(perPersonTip);
  displayBaseBill.textContent = formatCurrency(baseBill);
  displayTotalTip.textContent = formatCurrency(calculatedTip);
  displayTotalBill.textContent = formatCurrency(totalWithTip);
  displayTipRate.textContent = `${state.tipPercent}%`;

  // Render Ratio Bar
  if (totalWithTip > 0) {
    const billRatio = Math.round((baseBill / totalWithTip) * 100);
    const tipRatio = 100 - billRatio;
    barBill.style.width = `${billRatio}%`;
    barTip.style.width = `${tipRatio}%`;
    ratioBillPct.textContent = `${billRatio}%`;
    ratioTipPct.textContent = `${tipRatio}%`;
  } else {
    barBill.style.width = '100%';
    barTip.style.width = '0%';
    ratioBillPct.textContent = '100%';
    ratioTipPct.textContent = '0%';
  }

  // Update badge
  tipBadge.textContent = `${state.tipPercent}%`;
  stepperUnitLabel.textContent = people === 1 ? 'person' : 'people';
}

/**
 * Set active tip chip
 */
function setTipPercent(percent, isCustom = false) {
  state.tipPercent = percent;
  state.isCustomTip = isCustom;

  // Clear chip active states
  tipChips.forEach(chip => {
    if (!isCustom && parseInt(chip.dataset.tip, 10) === percent) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  if (isCustom) {
    customTipChip.classList.add('active');
    customTipContainer.classList.remove('hidden');
    tipSlider.value = Math.min(100, percent);
    customTipInput.value = percent;
  } else {
    customTipChip.classList.remove('active');
    customTipContainer.classList.add('hidden');
  }

  updateCalculations();
}

/**
 * Reset all fields
 */
function resetAll() {
  billInput.value = '';
  state.billAmount = 0;
  state.splitCount = 1;
  splitInput.value = '1';
  roundToggle.checked = false;
  state.roundUp = false;
  setTipPercent(15, false);
  updateCalculations();
  showToast('Reset to default values');
  billInput.focus();
}

/**
 * Build clipboard summary
 */
function getSummaryText() {
  const people = state.splitCount;
  const baseBill = state.billAmount;
  const tipPct = state.tipPercent;
  const totalTip = displayTotalTip.textContent;
  const totalBill = displayTotalBill.textContent;
  const perPerson = displayPerPerson.textContent;

  return [
    `🧾 TipWise Summary Breakdown:`,
    `--------------------------------`,
    `Base Bill: ${formatCurrency(baseBill)}`,
    `Tip (${tipPct}%): ${totalTip}`,
    `Total Bill: ${totalBill}`,
    `Split: ${people} ${people === 1 ? 'person' : 'people'}`,
    `👉 Per Person Total: ${perPerson}`,
    `--------------------------------`,
    `Calculated with TipWise (Cursor AI Mini App)`
  ].join('\n');
}

// -----------------------------------------------------------------------------
// Event Listeners
// -----------------------------------------------------------------------------

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

// Currency Change
currencySelect.addEventListener('change', (e) => {
  state.currency = e.target.value;
  currPrefix.textContent = state.currency;
  updateCalculations();
});

// Bill Amount Input
billInput.addEventListener('input', () => {
  updateCalculations();
});

// Tip Chips Click
tipChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const tipVal = parseInt(chip.dataset.tip, 10);
    setTipPercent(tipVal, false);
  });
});

// Custom Tip Chip Click
customTipChip.addEventListener('click', () => {
  setTipPercent(state.tipPercent, true);
  customTipInput.focus();
  customTipInput.select();
});

// Custom Tip Slider
tipSlider.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10) || 0;
  customTipInput.value = val;
  state.tipPercent = val;
  updateCalculations();
});

// Custom Tip Number Input
customTipInput.addEventListener('input', (e) => {
  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
  tipSlider.value = Math.min(100, val);
  state.tipPercent = val;
  updateCalculations();
});

// Stepper Decrement
splitDecrease.addEventListener('click', () => {
  if (state.splitCount > 1) {
    state.splitCount--;
    splitInput.value = state.splitCount;
    updateCalculations();
  }
});

// Stepper Increment
splitIncrease.addEventListener('click', () => {
  if (state.splitCount < 100) {
    state.splitCount++;
    splitInput.value = state.splitCount;
    updateCalculations();
  }
});

// Stepper Direct Input
splitInput.addEventListener('input', (e) => {
  let val = parseInt(e.target.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 100) val = 100;
  state.splitCount = val;
  updateCalculations();
});

// Rounding Toggle
roundToggle.addEventListener('change', (e) => {
  state.roundUp = e.target.checked;
  updateCalculations();
});

// Reset Button
resetBtn.addEventListener('click', resetAll);

// Copy Summary
copySummaryBtn.addEventListener('click', async () => {
  const text = getSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Summary copied to clipboard!');
  } catch (err) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Summary copied to clipboard!');
  }
});

// Share Button
shareSummaryBtn.addEventListener('click', async () => {
  const text = getSummaryText();
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'TipWise Breakdown',
        text: text
      });
    } catch (e) {
      // User cancelled share
    }
  } else {
    // Copy fallback
    copySummaryBtn.click();
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  setTipPercent(15, false);
  updateCalculations();
});
