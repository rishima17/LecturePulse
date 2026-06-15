const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to the frontend URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a specific lecture room to receive updates only for that session
  socket.on('join-lecture', (lectureId) => {
    socket.join(lectureId);
    console.log(`Socket ${socket.id} joined lecture: ${lectureId}`);
  });

  // Handle new feedback submission
  socket.on('submit-feedback', (data) => {
    const { lectureId, feedback } = data;
    console.log(`Feedback received for lecture ${lectureId}`);
    
    // Broadcast to everyone in the lecture room EXCEPT the sender (the student)
    // although teachers are the main ones listening.
    socket.to(lectureId).emit('feedback-updated', feedback);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`LecturePulse Real-time Server running on port ${PORT}`);
});
