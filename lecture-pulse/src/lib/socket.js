import { io } from 'socket.io-client';

// Use environment variable if available, otherwise fallback to local server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinLectureRoom = (lectureId) => {
  if (socket.connected) {
    socket.emit('join-lecture', lectureId);
  } else {
    socket.once('connect', () => {
      socket.emit('join-lecture', lectureId);
    });
    socket.connect();
  }
};

export const emitFeedback = (lectureId, feedback) => {
  if (socket.connected) {
    socket.emit('submit-feedback', { lectureId, feedback });
  }
};
