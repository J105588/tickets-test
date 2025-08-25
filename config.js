// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwYhrwEJZI-TGYlqal4twTom90Fqp4ns8aR_HM63U1KEkOlVU8YTRo3SyFCI_nFa-FF/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
