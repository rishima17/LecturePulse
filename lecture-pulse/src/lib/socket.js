import { io } from "socket.io-client";

// Use environment variable if available, otherwise fallback to local server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

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

const emitWithConnection = (eventName, args = []) => {
  if (socket.connected) {
    socket.emit(eventName, ...args);
    return;
  }

  socket.once("connect", () => {
    socket.emit(eventName, ...args);
  });
  socket.connect();
};

export const joinLectureRoom = (lectureId, code) => {
  emitWithConnection("join-lecture", [lectureId, code]);
};

export const validateCode = (code) => {
  return new Promise((resolve) => {
    if (socket.connected) {
      socket.emit("validate-code", code, (response) => resolve(response.available));
      return;
    }

    socket.once("connect", () => {
      socket.emit("validate-code", code, (response) => resolve(response.available));
    });
    socket.connect();
  });
};

export const emitFeedback = (lectureId, feedback) => {
  emitWithConnection("submit-feedback", [{ lectureId, feedback }]);
};

export const startLive = (payload) => {
  emitWithConnection("start-live", [payload]);
};

export const joinLive = (payload) => {
  emitWithConnection("join-live", [payload]);
};

export const leaveLive = (payload) => {
  emitWithConnection("leave-live", [payload]);
};

export const sendLiveChat = (payload) => {
  emitWithConnection("live-chat", [payload]);
};

export const endLive = (payload) => {
  emitWithConnection("end-live", [payload]);
};
