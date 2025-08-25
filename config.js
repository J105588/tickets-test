// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxbpxdXeGqy5oQ-5jbgzhEjGw-vY2wMVgnHiw7zG4tvERExFvH9Xx1ZVZYYJ1bHBCrJ/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
