// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbx4fX3geK1YNq9HBUsElscnPjHbFcvyXMUlPHMjP8A8nej_RM21arWDMcFPC3iMhzE/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
