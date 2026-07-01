import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAuthToken } from '../features/auth/authSlice.js';

/**
 * Global Socket.IO connection hook.
 * Manages connection lifecycle, room joining, and event listeners.
 *
 * Usage:
 *   const { socket, on, off, emit } = useSocket();
 */
export function useSocket() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAuthToken);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Connect to server
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Join personal room
    socket.emit('join:user', user._id);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    on,
    off,
    emit,
    isConnected: !!socketRef.current?.connected,
  };
}

/**
 * Hook to track order status changes via Socket.IO.
 *
 * Usage:
 *   useOrderTracking(orderId, (data) => { console.log(data.status) });
 */
export function useOrderTracking(orderId, onStatusChange) {
  const { on, off, emit } = useSocket();

  useEffect(() => {
    if (!orderId) return;

    emit('join:order', orderId);

    const handler = (data) => {
      if (data.orderId === orderId && onStatusChange) {
        onStatusChange(data);
      }
    };

    on('order:status', handler);

    return () => {
      off('order:status', handler);
      emit('leave:order', orderId);
    };
  }, [orderId, on, off, emit, onStatusChange]);
}
