/**
 * 当日券発行画面のメイン処理
 */

import GasAPI from './api.js'; // GasAPIをインポート
import { loadSidebar, toggleSidebar, showModeChangeModal, applyModeChange, closeModeModal } from './sidebar.js';

// URLパラメータ取得
const urlParams = new URLSearchParams(window.location.search);
const GROUP = urlParams.get('group');
const DAY = urlParams.get('day');
const TIMESLOT = urlParams.get('timeslot');

// 初期化
window.onload = () => {
  // サイドバー読み込み
  loadSidebar();
  
  // 表示情報設定
  const groupName = isNaN(parseInt(GROUP)) ? GROUP : GROUP + '組';
  document.getElementById('performance-info').textContent = `${groupName} ${DAY}日目 ${TIMESLOT}`;
  document.getElementById('reservation-details').innerHTML = `
    座席が確保されました<br>
    ${groupName} ${DAY}日目 ${TIMESLOT}
  `;
  
  // 当日券モードのアクセス制限をチェック
  checkWalkinModeAccess();
};

// 当日券モードのアクセス制限をチェックする関数
function checkWalkinModeAccess() {
  const currentMode = localStorage.getItem('currentMode');
  const walkinBtn = document.getElementById('walkin-btn');
  
  if (currentMode !== 'walkin' && currentMode !== 'admin') {
    walkinBtn.disabled = true;
    walkinBtn.textContent = '当日券モードでログインしてください';
    alert('当日券発行には当日券モードまたは管理者モードでのログインが必要です。');
  }
}

function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  if (loader) {
    loader.style.display = visible ? 'block' : 'none';
  }
}

async function issueWalkinTicket() {
  const walkinBtn = document.getElementById('walkin-btn');
  const reservationResult = document.getElementById('reservation-result');
  const reservedSeatEl = document.getElementById('reserved-seat');
  
  walkinBtn.disabled = true;
  walkinBtn.textContent = '空席を検索中...';
  showLoader(true);
  
  reservationResult.classList.remove('show');

  try {
    const response = await GasAPI.assignWalkInSeat(GROUP, DAY, TIMESLOT);
    
    if (response.success) {
      alert(response.message || '座席が確保されました。');
      walkinBtn.textContent = `発行完了 (座席: ${response.seatId || '不明'})`;
      walkinBtn.style.background = '#28a745';
      
      if (response.seatId) {
        reservedSeatEl.textContent = response.seatId;
        reservationResult.classList.add('show');
      }
      
      setTimeout(() => {
        walkinBtn.disabled = false;
        walkinBtn.textContent = '再度、空席を探して当日券を発行する';
        walkinBtn.style.background = '#007bff'; // 通常の色に戻す
      }, 3000);
    } else {
      alert(response.message || '空席が見つかりませんでした。');
      walkinBtn.disabled = false;
      walkinBtn.textContent = '再度、空席を探す';
    }
  } catch (error) {
    alert("エラーが発生しました: " + error.message);
    walkinBtn.disabled = false;
    walkinBtn.textContent = '空席を探して当日券を発行する';
  } finally {
    showLoader(false);
  }
}

// ボタン押下時に実行されるようにイベントリスナーを追加
document.getElementById('walkin-btn').addEventListener('click', issueWalkinTicket);
