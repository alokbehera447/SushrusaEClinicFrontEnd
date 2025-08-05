import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
  user_role?: string;
}

export interface DoctorStatusUpdate {
  doctor_id: number;
  doctor_name: string;
  doctor_email: string;
  doctor_specialization: string;
  doctor_profile_picture: string | null;
  is_online: boolean;
  is_logged_in: boolean;
  is_available: boolean;
  current_status: string;
  status_display: string;
  is_active: boolean;
  last_activity: string;
  last_activity_formatted: string;
  last_login: string | null;
  last_login_formatted: string | null;
  current_consultation: number | null;
  current_consultation_info: any;
  status_updated_at: string;
  status_note: string;
  auto_away_threshold: number;
}

export interface SuperAdminRequest {
  from_superadmin: string;
  target_doctor_id: number;
  request_type: string;
  message: string;
  timestamp: string;
}

export interface DoctorResponse {
  from_doctor: string;
  doctor_name: string;
  request_id: string;
  response_type: string;
  message: string;
  timestamp: string;
}

export interface UseDoctorSuperAdminWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
  userRole: string | null;
}

export const useDoctorSuperAdminWebSocket = (
  onStatusUpdate?: (status: DoctorStatusUpdate) => void,
  onSuperAdminRequest?: (request: SuperAdminRequest) => void,
  onDoctorResponse?: (response: DoctorResponse) => void,
  onConnect?: () => void,
  onDisconnect?: () => void
): UseDoctorSuperAdminWebSocketReturn => {
  const { user, accessToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const hasAttemptedConnectionRef = useRef(false);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!accessToken) {
      console.log('❌ No authentication token available for WebSocket connection');
      setError('No authentication token available');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected, skipping connection attempt');
      return;
    }

    if (isConnecting) {
      console.log('⏳ WebSocket connection already in progress, skipping...');
      return;
    }

    console.log('🚀 Attempting to connect to Doctor-SuperAdmin WebSocket...');
    console.log('👤 User:', user?.name, 'Role:', user?.role);
    console.log('🔑 Token available:', !!accessToken);
    
    setIsConnecting(true);
    setError(null);

    try {
      // Connect to the doctor-superadmin WebSocket
      const wsUrl = 'wss://sushrusaeclinic.com/ws/doctor-superadmin/';
      console.log('🌐 Connecting to WebSocket URL:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connection opened, sending authentication...');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        hasAttemptedConnectionRef.current = true;
        onConnect?.();

        // Send authentication token
        const authMessage = {
          type: 'auth',
          token: accessToken
        };
        console.log('🔐 Sending authentication message:', { type: authMessage.type, tokenLength: accessToken?.length });
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth_success':
              setUserRole(message.user_role || null);
              console.log('✅ WebSocket AUTHENTICATION SUCCESSFUL!');
              console.log('👨‍⚕️ User Role:', message.user_role);
              console.log('🎉 Doctor is now connected to SuperAdmin dashboard');
              break;
            case 'status_update':
              if (onStatusUpdate && message.data) {
                onStatusUpdate(message.data);
              }
              break;
            case 'superadmin_request':
              if (onSuperAdminRequest && message.data) {
                onSuperAdminRequest(message.data);
              }
              break;
            case 'doctor_response':
              if (onDoctorResponse && message.data) {
                onDoctorResponse(message.data);
              }
              break;
            case 'heartbeat_response':
              // Heartbeat response - connection is alive
              break;
            case 'error':
              console.error('❌ WebSocket error:', message.message);
              setError(message.message || 'WebSocket error');
              break;
            case 'auth_error':
              console.error('❌ WebSocket authentication failed:', message.message);
              setError(message.message || 'Authentication failed');
              break;
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        setUserRole(null);
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
  }, [accessToken]);

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
    setUserRole(null);
    reconnectAttemptsRef.current = 0;
    hasAttemptedConnectionRef.current = false;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    console.log('🔍 WebSocket useEffect triggered');
    console.log('👤 User object:', user);
    console.log('🔑 Access token:', accessToken);
    console.log('🔑 Access token length:', accessToken?.length);
    
    if (accessToken && !isConnected && !isConnecting && !hasAttemptedConnectionRef.current) {
      console.log('🔄 User token detected, initiating WebSocket connection...');
      hasAttemptedConnectionRef.current = true;
      connect();
    } else if (!accessToken) {
      console.log('⏳ Waiting for user authentication token...');
      console.log('❌ Token not available - user:', !!user, 'accessToken:', !!accessToken);
      hasAttemptedConnectionRef.current = false;
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      disconnect();
    };
  }, [accessToken]);

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
    disconnect,
    userRole
  };
}; 