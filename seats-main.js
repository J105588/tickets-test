// seats-main.js
import GasAPI from './api.js';
import { loadSidebar, toggleSidebar, showModeChangeModal, applyModeChange, closeModeModal } from './sidebar.js';
import { GAS_API_URL, DEBUG_MODE, debugLog } from './config.js';

/**
 * 座席選択画面のメイン処理
 */
const urlParams = new URLSearchParams(window.location.search);
const GROUP = urlParams.get('group') || '見本演劇';
const DAY = urlParams.get('day') || '1';
const TIMESLOT = urlParams.get('timeslot') || 'A';
const IS_ADMIN = urlParams.get('admin') === 'true';

let selectedSeats = [];
let isAutoRefreshEnabled = true;
let autoRefreshInterval = null;
let lastUpdateTime = null;
let isRefreshing = false;
let settingsOpen = false;

// APIエンドポイントを設定
const apiEndpoint = GAS_API_URL;
// GasAPIはstaticメソッドを使用するため、インスタンス化は不要

// 初期化
window.onload = async () => {
  loadSidebar();

  const groupName = isNaN(parseInt(GROUP)) ? GROUP : GROUP + '組';
  const performanceInfo = document.getElementById('performance-info');
  if (performanceInfo) {
    performanceInfo.textContent = `${groupName} ${DAY}日目 ${TIMESLOT}`;
  }

  // 現在のモードを取得
  const currentMode = localStorage.getItem('currentMode') || 'normal';
  const isAdminMode = currentMode === 'admin' || IS_ADMIN;

  // 管理者モードの表示制御
  const adminIndicator = document.getElementById('admin-indicator');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const submitButton = document.getElementById('submit-button');
  const checkInSelectedBtn = document.getElementById('check-in-selected-btn');
  
  if (isAdminMode) {
    if (adminIndicator) adminIndicator.style.display = 'block';
    if (adminLoginBtn) adminLoginBtn.style.display = 'none';
    if (submitButton) submitButton.style.display = 'none';
    if (checkInSelectedBtn) checkInSelectedBtn.style.display = 'block';
  } else {
    if (adminIndicator) adminIndicator.style.display = 'none';
    if (adminLoginBtn) adminLoginBtn.style.display = 'block';
    if (submitButton) submitButton.style.display = 'block';
    if (checkInSelectedBtn) checkInSelectedBtn.style.display = 'none';
  }

  showLoader(true);

  try {
    // 現在のモードを取得して管理者権限を判定
    const currentMode = localStorage.getItem('currentMode') || 'normal';
    const isAdminMode = currentMode === 'admin' || IS_ADMIN;
    
    console.log('GasAPI.getSeatData呼び出し:', { GROUP, DAY, TIMESLOT, isAdminMode });
    const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, isAdminMode);
    
    // 詳細なデバッグ情報をコンソールに出力
    console.log("===== 座席データ詳細情報 =====");
    console.log("Received seatData:", seatData);
    
    if (seatData.seatMap) {
      console.log("座席マップ構造:", Object.keys(seatData.seatMap));
      console.log("座席データサンプル:", Object.values(seatData.seatMap).slice(0, 3));
    } else {
      console.log("座席マップが存在しません");
    }
    console.log("===== 座席データ詳細情報終了 =====");
    
    if (seatData.success === false) {
      const errorMsg = seatData.error || 'データ読み込みに失敗しました';
      console.error('座席データ読み込み失敗:', errorMsg);
      document.getElementById('error-message').textContent = 'データ読み込み失敗: ' + errorMsg;
      document.getElementById('error-container').style.display = 'flex';
      return;
    }

    drawSeatMap(seatData.seatMap);
    updateLastUpdateTime();
    updateSelectedSeatsDisplay(); // 初期化時に選択された座席数を更新
    startAutoRefresh();
  } catch (error) {
    console.error('サーバー通信失敗:', error);
    document.getElementById('error-message').textContent = 'サーバー通信失敗: ' + error.message;
    document.getElementById('error-container').style.display = 'flex';
  } finally {
    showLoader(false);
  }
};

// 最終アップデート時間を取得
function updateLastUpdateTime() {
  lastUpdateTime = new Date();
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `最終更新: ${lastUpdateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    console.warn('最終更新時間を表示する要素が見つかりません');
  }
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  if (loader) {
    loader.style.display = visible ? 'block' : 'none';
  }
}

// 座席マップを描画する関数
function drawSeatMap(seatMap) {
  const container = document.getElementById('seat-map-container');
  if (!container) {
    console.error('座席マップコンテナが見つかりません');
    return;
  }
  container.innerHTML = '';

  const layout = {
    rows: ['A', 'B', 'C', 'D', 'E'],
    cols: 12,
    passageAfter: 6
  };

  const seatSection = document.createElement('div');
  seatSection.className = 'seat-section';

  layout.rows.forEach(rowLabel => {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';
      
      for (let i = 1; i <= layout.cols; i++) {
          let seatId;
          
          if (rowLabel === 'E') {
              // E列は4,5,6,7,8,9の位置に1,2,3,4,5,6が配置される
              if (i >= 4 && i <= 9) {
                  const eSeatNumber = i - 3; // 1,2,3,4,5,6
                  seatId = 'E' + eSeatNumber;
              } else {
                  // 1,2,3,10,11,12の位置は空席（通路または使用不可）
                  const emptySpace = document.createElement('div');
                  emptySpace.className = 'empty-space';
                  rowEl.appendChild(emptySpace);
                  continue;
              }
          } else {
              // A-D列は通常通り1-12の位置
              seatId = rowLabel + i;
          }
          
          const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
          rowEl.appendChild(createSeatElement(seatData));

          if (i === layout.passageAfter) {
              const passage = document.createElement('div');
              passage.className = 'passage';
              rowEl.appendChild(passage);
          }
      }
      seatSection.appendChild(rowEl);
  });

  container.appendChild(seatSection);
}

// 自動更新機能の実装
function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  if (isAutoRefreshEnabled) {
    autoRefreshInterval = setInterval(async () => {
      if (isRefreshing) return; // 既に更新中なら何もしない
      
      isRefreshing = true;
      try {
        // 現在のモードを取得して管理者権限を判定
        const currentMode = localStorage.getItem('currentMode') || 'normal';
        const isAdminMode = currentMode === 'admin' || IS_ADMIN;
        
        const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, isAdminMode);
        
        if (seatData.success) {
          drawSeatMap(seatData.seatMap);
          updateLastUpdateTime();
        }
      } catch (error) {
        console.error('自動更新エラー:', error);
      } finally {
        isRefreshing = false;
      }
    }, 30000); // 30秒ごとに更新
  }
}

// 自動更新の切り替え
function toggleAutoRefresh() {
  isAutoRefreshEnabled = !isAutoRefreshEnabled;
  const toggleBtn = document.getElementById('auto-refresh-toggle');
  
  if (toggleBtn) {
    toggleBtn.textContent = isAutoRefreshEnabled ? '自動更新: ON' : '自動更新: OFF';
  }
  
  if (isAutoRefreshEnabled) {
    startAutoRefresh();
  } else if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// 座席要素を作成する関数
function createSeatElement(seatData) {
  const seat = document.createElement('div');
  seat.className = `seat ${seatData.status}`;
  seat.dataset.id = seatData.id;
  seat.textContent = seatData.id;
  
  if (seatData.name && seatData.status !== 'available') {
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = seatData.name;
    seat.appendChild(tooltip);
  }
  
  seat.addEventListener('click', () => handleSeatClick(seatData));
  return seat;
}

// 座席クリック時の処理
function handleSeatClick(seatData) {
  // 管理者モードの場合は何もしない
  const currentMode = localStorage.getItem('currentMode') || 'normal';
  if (currentMode === 'admin' || IS_ADMIN) {
    return;
  }

  // 利用可能な座席のみ選択可能
  if (seatData.status !== 'available') {
    console.log('この座席は選択できません:', seatData.status);
    return;
  }

  const seatElement = document.querySelector(`[data-id="${seatData.id}"]`);
  if (!seatElement) return;

  // 座席の選択状態を切り替え
  if (seatElement.classList.contains('selected')) {
    // 選択解除
    seatElement.classList.remove('selected');
    selectedSeats = selectedSeats.filter(id => id !== seatData.id);
  } else {
    // 選択
    seatElement.classList.add('selected');
    selectedSeats.push(seatData.id);
  }

  // 選択された座席数を表示
  updateSelectedSeatsDisplay();
  
  console.log('選択された座席:', selectedSeats);
}

// 選択された座席数の表示を更新
function updateSelectedSeatsDisplay() {
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    if (selectedSeats.length > 0) {
      submitButton.textContent = `この席で予約する (${selectedSeats.length}席)`;
      submitButton.disabled = false;
    } else {
      submitButton.textContent = 'この席で予約する';
      submitButton.disabled = true;
    }
  }
}

// グローバル関数として設定
window.showLoader = showLoader;
window.toggleAutoRefresh = toggleAutoRefresh;
