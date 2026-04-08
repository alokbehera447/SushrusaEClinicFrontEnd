import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

export interface DoctorStatusData {
  doctor_id: number;
  doctor_name: string;
  doctor_email: string;
  doctor_specialization: string;
  doctor_profile_picture: string | null;
  is_online: boolean;
  is_logged_in: boolean;
  is_available: boolean;
  current_status: 'available' | 'consulting' | 'busy' | 'away' | 'offline' | 'break' | 'unavailable';
  status_display: string;
  is_active: boolean;
  last_activity: string;
  last_activity_formatted: string;
  last_login: string | null;
  last_login_formatted: string | null;
  current_consultation: number | null;
  current_consultation_info: {
    id: number;
    patient_name: string;
    scheduled_time: string;
  } | null;
  status_updated_at: string;
  status_note: string;
  auto_away_threshold: number;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (
  endpoint: string,
  onMessage?: (message: WebSocketMessage) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
): UseWebSocketReturn => {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user?.access_token) {
      setError('No authentication token available');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get the base URL from the current window location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}${endpoint}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Send authentication token
        ws.send(JSON.stringify({
          type: 'auth',
          token: user.access_token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

    } catch (err) {
      setIsConnecting(false);
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [endpoint, user?.access_token, onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    if (user?.access_token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.access_token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    sendMessage,
    reconnect,
    disconnect
  };
}; 