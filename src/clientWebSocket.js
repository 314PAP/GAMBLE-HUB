// clientWebSocket.js – Centralized WebSocket helper with reconnection

export class ClientWebSocket {
  constructor(url) {
    this.url = url;
    this.maxRetries = 5;
    this.retryCount = 0;
    this.backoff = 1000; // start with 1s
    this.connect();
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);
      this.socket.addEventListener('open', () => this.onOpen());
      this.socket.addEventListener('message', (e) => this.onMessage(e));
      this.socket.addEventListener('close', (e) => this.onClose(e));
      this.socket.addEventListener('error', (e) => this.onError(e));
    } catch (e) {
      console.error('WebSocket init error', e);
    }
  }

  onOpen() {
    console.log('WebSocket connected to', this.url);
    this.retryCount = 0; // reset retries
  }

  onMessage(event) {
    // Simple dispatcher – other modules can listen via custom events
    const data = event.data;
    const customEvent = new CustomEvent('ws-message', { detail: data });
    window.dispatchEvent(customEvent);
  }

  onClose(event) {
    console.warn('WebSocket closed', event);
    this.scheduleReconnect();
  }

  onError(event) {
    console.error('WebSocket error', event);
    this.socket.close(); // ensure close triggers reconnection
  }

  scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error('WebSocket max reconnection attempts reached');
      return;
    }
    const delay = this.backoff * Math.pow(2, this.retryCount);
    console.log(`Reconnecting WebSocket in ${delay}ms`);
    setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, delay);
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.warn('WebSocket not open, cannot send');
    }
  }
}
