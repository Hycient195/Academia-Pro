// Temporary interface until socket.io-client is installed
interface Socket {
  id: string;
  connected: boolean;
  disconnect(): void;
  emit(event: string, data?: unknown): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback?: (...args: unknown[]) => void): void;
}

interface SocketIOOptions {
  auth?: { token?: string };
  transports?: string[];
  timeout?: number;
  forceNew?: boolean;
}

interface SocketIO {
  (url: string, options?: SocketIOOptions): Socket;
}

declare const io: SocketIO;

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  maxReconnectionDelay?: number;
  reconnectionDelayGrowth?: number;
  timeout?: number;
  fallbackEnabled?: boolean;
  fallbackPollInterval?: number;
}

interface WebSocketMessage {
  event: string;
  data: unknown;
  timestamp: Date;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastMessage: WebSocketMessage | null;
  connectionId: string | null;
  isUsingFallback: boolean;
  fallbackPollInterval: number;
  reconnectAttempts: number;
  lastReconnectAttempt: Date | null;
}

interface SubscriptionData {
  eventTypes?: string[];
  severities?: string[];
  resources?: string[];
  users?: string[];
  minSeverity?: string;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    namespace = '/audit',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    maxReconnectionDelay = 30000,
    reconnectionDelayGrowth = 2,
    timeout = 20000,
    fallbackEnabled = true,
    fallbackPollInterval = 30000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    lastMessage: null,
    connectionId: null,
    isUsingFallback: false,
    fallbackPollInterval,
    reconnectAttempts: 0,
    lastReconnectAttempt: null,
  });

  const getAuthToken = useCallback(() => {
    // Get token from cookies or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1] ||
      localStorage.getItem('auth-token');

    return token;
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState(prev => ({ ...prev, isConnecting: true, connectionError: null }));

    const token = getAuthToken();
    if (!token) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'No authentication token found'
      }));
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    socketRef.current = io(`${serverUrl}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        connectionError: null,
        connectionId: socket.id,
      }));
      reconnectAttemptsRef.current = 0;
    });

    socket.on('disconnect', (reason) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionId: null,
      }));

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        if (reconnection && reconnectAttemptsRef.current < reconnectionAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectionDelay * Math.pow(2, reconnectAttemptsRef.current)); // Exponential backoff
        }
      }
    });

    socket.on('connect_error', (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: errorMessage,
      }));

      if (reconnection && reconnectAttemptsRef.current < reconnectionAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, reconnectionDelay * Math.pow(2, reconnectAttemptsRef.current));
      }
    });

    socket.on('error', (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'WebSocket error';
      setState(prev => ({
        ...prev,
        connectionError: errorMessage,
      }));
    });

    socket.on('reconnect', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionError: null,
      }));
      reconnectAttemptsRef.current = 0;
    });

    socket.on('reconnect_error', () => {
      reconnectAttemptsRef.current++;
    });

  }, [namespace, getAuthToken, reconnection, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      lastMessage: null,
      connectionId: null,
      isUsingFallback: false,
    }));
  }, []);

  const subscribe = useCallback((subscriptionData: SubscriptionData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', subscriptionData);
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe');
    }
  }, []);

  const sendMessage = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const onMessage = useCallback((event: string, callback: (data: unknown) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, (data: unknown) => {
        setState(prev => ({ ...prev, lastMessage: { event, data, timestamp: new Date() } }));
        callback(data);
      });
    }
  }, []);

  const offMessage = useCallback((event: string, callback?: (data: unknown) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    connectionError: state.connectionError,
    lastMessage: state.lastMessage,
    connectionId: state.connectionId,

    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    onMessage,
    offMessage,

    // Socket instance (for advanced usage)
    socket: socketRef.current,
  };
}