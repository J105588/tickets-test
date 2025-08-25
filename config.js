// config.js
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbz8OUO4UvCeN71KgnMy-AlaPPLhM5o_SwIm1vVmoYqbxVkFOw9PrFNjulzdPOm03os9/exec";
const DEBUG_MODE = true;

function debugLog(message, obj = null) {
  if (DEBUG_MODE) {
    console.log(message, obj || '');
  }
}

// 個別にエクスポート
export { GAS_API_URL, DEBUG_MODE, debugLog };
