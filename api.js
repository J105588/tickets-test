// api.js
import { GAS_API_URL, DEBUG_MODE, debugLog } from './config.js';

class GasAPI {
  static _callApi(functionName, params = []) {
    return new Promise((resolve, reject) => {
      try {
        debugLog(`API Call (JSONP): ${functionName}`, params);

        const callbackName = 'jsonpCallback_' + functionName + '_' + Date.now();
        const encodedParams = encodeURIComponent(JSON.stringify(params));
        const encodedFuncName = encodeURIComponent(functionName);

        let timeoutId;
        const cleanup = () => {
          try {
            if (timeoutId) clearTimeout(timeoutId);
            if (window[callbackName]) {
              delete window[callbackName];
            }
            if (script && script.parentNode) {
              script.parentNode.removeChild(script);
            }
          } catch (_) {}
        };
        
        // 先にコールバックを登録
        window[callbackName] = (data) => {
          debugLog(`API Response (JSONP): ${functionName}`, data);
          cleanup();
          if (data && typeof data === 'object') {
            resolve(data);
          } else {
            reject(new Error('無効なAPIレスポンスです'));
          }
        };

        // タイムアウト安全策
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('APIタイムアウト'));
        }, 15000);

        const url = `${GAS_API_URL}?callback=${callbackName}`;
        const script = document.createElement('script');
        const formData = `func=${encodedFuncName}&params=${encodedParams}`;
        script.src = `${url}&${formData}`;
        script.onerror = (error) => {
          cleanup();
          this._reportError(`JSONPリクエストに失敗しました: ${error.message || 'network'}`);
          reject(new Error(`JSONPリクエストに失敗しました: ${error.message || 'network'}`));
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('API call exception:', err);
        this._reportError(`API呼び出し例外: ${err.message}`);
        reject(err);
      }
    });
  }

  static _reportError(errorMessage) {
    // エラー詳細をコンソールに出力
    console.error('API Error Details:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    
    // UIにエラーメッセージを表示
    try {
      const errorContainer = document.getElementById('error-container');
      const errorMessageElement = document.getElementById('error-message');
      
      if (errorContainer && errorMessageElement) {
        errorMessageElement.textContent = 'サーバー通信失敗: ' + errorMessage;
        errorContainer.style.display = 'flex';
      }
    } catch (e) {
      console.error('エラー表示に失敗しました:', e);
    }
    
    // エラー報告APIを呼び出す
    try {
      const callbackName = 'jsonpCallback_reportError_' + Date.now();
      const script = document.createElement('script');
      
      window[callbackName] = (data) => {
        try {
          delete window[callbackName]; // コールバック関数を削除
          if (script && script.parentNode) {
            script.parentNode.removeChild(script); // スクリプトタグを削除
          }
          console.log('Error reported to server:', data);
        } catch (e) {
          console.error('Error cleanup failed:', e);
        }
      };

      let url = `${GAS_API_URL}?callback=${callbackName}&func=reportError&params=${encodeURIComponent(JSON.stringify([errorMessage]))}`;
      script.src = url;
      document.head.appendChild(script);
    } catch (e) {
      console.error('Error reporting failed:', e);
    }
  }

  static async getAllTimeslotsForGroup(group) {
    const response = await this._callApi('getAllTimeslotsForGroup', [group]);
    return response.data; // データを返す
  }

  static async testApi() {
    const response = await this._callApi('testApi');
    return response.data;
  }

  static async verifyModePassword(mode, password) {
    const response = await this._callApi('verifyModePassword', [mode, password]);
    return response;
  }

  static async getSeatData(group, day, timeslot, isAdmin) {
    const response = await this._callApi('getSeatData', [group, day, timeslot, isAdmin]);
    return response;
  }

  static async getSeatDataVersion(group, day, timeslot) {
    const response = await this._callApi('getSeatDataVersion', [group, day, timeslot]);
    return response;
  }

  static async assignWalkInSeat(group, day, timeslot) {
    const response = await this._callApi('assignWalkInSeat', [group, day, timeslot]);
    return response;
  }

  static async reserveSeats(group, day, timeslot, selectedSeats) {
    const response = await this._callApi('reserveSeats', [group, day, timeslot, selectedSeats]);
    return response;
  }

  static async checkInSeat(group, day, timeslot, seatId) {
    const response = await this._callApi('checkInSeat', [group, day, timeslot, seatId]);
    return response;
  }

  static async checkInMultipleSeats(group, day, timeslot, seatIds) {
    const response = await this._callApi('checkInMultipleSeats', [group, day, timeslot, seatIds]);
    return response;
  }

  static async assignWalkInSeats(group, day, timeslot, count) {
    const response = await this._callApi('assignWalkInSeats', [group, day, timeslot, count]);
    return response;
  }
}

export default GasAPI;
