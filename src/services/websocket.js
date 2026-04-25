//frontend\src\services\websocket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sammy-ulfh.dev";
const WEBSOCKET_URL = `${BASE_URL}/api/ws`;

let stompClient = null;

export function conectarWebSocket({ onAlerta, onRecordatorio }) {
  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(WEBSOCKET_URL, null, {
        transports: ["xhr-streaming", "xhr-polling"],
      }),
    reconnectDelay: 5000,
    debug: (mensaje) => {
      console.log(`[STOMP] ${mensaje}`);
    },

    onConnect: () => {
      console.log("WebSocket conectado");

      stompClient.subscribe("/topic/alertas", (frame) => {
        try {
          const data = JSON.parse(frame.body);
          onAlerta(data);
        } catch {
          onAlerta({ texto: frame.body });
        }
      });

      stompClient.subscribe("/topic/recordatorios", (frame) => {
        try {
          const data = JSON.parse(frame.body);
          onRecordatorio(data);
        } catch {
          onRecordatorio({ texto: frame.body });
        }
      });
    },

    onStompError: (frame) => {
      console.error("Error WebSocket:", frame);
    },

    onWebSocketError: (event) => {
      console.error("Error del socket WebSocket:", event);
    },

    onWebSocketClose: (event) => {
      console.warn("WebSocket cerrado:", event);
    },
  });

  stompClient.activate();
}

export function desconectarWebSocket() {
  stompClient?.deactivate();
}
