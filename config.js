// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyqOAh_4U3I-l0A-xz55XHV0WZYDf6Jasp7t9ODF_0WM-ks034qWi9x9S-_itWFytEy/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
