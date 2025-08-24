// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwqvoWqSkaw4hugbN20dBodJIx_cxHsF7ov1mv7CW2nEragb2MPRB5U1nmUcfrgQ7RC/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
