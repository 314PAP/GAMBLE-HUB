import { ClientWebSocket } from "./clientWebSocket.js";
import { formatLargeNumber } from "./utils.js";

const BIG_WIN_THRESHOLD = 250;
let wsClient = null;
let broadcastChannel = null;

/**
 * Initialize live big-win feed via WebSocket (when VITE_WS_URL is set) and BroadcastChannel.
 * @param {import('./ui.js').GameUI} ui
 */
export function initLiveFeed(ui) {
  const wsUrl = import.meta.env?.VITE_WS_URL;
  if (wsUrl && typeof WebSocket !== "undefined") {
    wsClient = new ClientWebSocket(wsUrl);
    window.addEventListener("ws-message", (e) => {
      handleIncomingFeedMessage(e.detail, ui);
    });
  }

  if (typeof BroadcastChannel !== "undefined") {
    broadcastChannel = new BroadcastChannel("gamblehub-live");
    broadcastChannel.onmessage = (e) => {
      handleIncomingFeedMessage(e.data, ui);
    };
  }
}

export function handleIncomingFeedMessage(raw, ui) {
  try {
    const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!msg || msg.type !== "big_win" || !msg.username || !msg.winAmount) return;
    const prefix = msg.isJackpot ? "🎰 JACKPOT!" : "🔥 Velká výhra!";
    ui?.showAlert(
      "info",
      prefix,
      `${msg.username} právě vyhrál ${formatLargeNumber(msg.winAmount)} ve hře ${msg.gameName}!`
    );
  } catch {
    // Ignore malformed messages
  }
}

/**
 * Broadcast a big win to connected WebSocket peers and other open browser tabs.
 */
export function broadcastBigWin(username, gameName, winAmount, isJackpot = false) {
  if (!username || (!isJackpot && winAmount < BIG_WIN_THRESHOLD)) return;
  const payload = {
    type: "big_win",
    username,
    gameName,
    winAmount,
    isJackpot,
    timestamp: Date.now(),
  };

  if (wsClient) {
    wsClient.send(JSON.stringify(payload));
  }
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch {
      // Ignore closed channel errors
    }
  }
}
