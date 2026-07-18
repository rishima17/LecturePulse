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

export const joinLectureRoom = (lectureId, code) => {
  if (socket.connected) {
    socket.emit('join-lecture', lectureId, code);
  } else {
    socket.once('connect', () => {
      socket.emit('join-lecture', lectureId, code);
    });
    socket.connect();
  }
};

export const validateCode = (code) => {
  return new Promise((resolve) => {
    if (!socket.connected) {
      socket.once('connect', () => {
        socket.emit('validate-code', code, (response) => resolve(response.available));
      });
      socket.connect();
    } else {
      socket.emit('validate-code', code, (response) => resolve(response.available));
    }
  });
};

export const emitFeedback = (lectureId, feedback) => {
  if (socket.connected) {
    socket.emit('submit-feedback', { lectureId, feedback });
  }
};

export const emitReaction = (lectureId, reactionType) => {
  if (socket.connected) {
    socket.emit('submit-reaction', { lectureId, reactionType });
  }
};

