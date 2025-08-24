// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxs7GsDvSCJ4FHB37nu-fgCTzp478cPqLjnfozjSJtM_uXjex_4JIUanoMDiP6E33C7/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
