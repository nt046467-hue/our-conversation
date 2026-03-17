const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// static files
app.use(express.static(path.join(__dirname, "public")));

// track connected user sockets
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  connectedUsers[socket.id] = "Karu";

  // Broadcast user status online to others
  socket.broadcast.emit("user status", {
    user: "Karu",
    status: "online",
  });

  socket.on("chat message", (messageData) => {
    // Broadcast message to all clients (including sender for sync) if desired
    io.emit("chat message", messageData);
  });

  socket.on("typing", (typingData) => {
    socket.broadcast.emit("typing", typingData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete connectedUsers[socket.id];

    socket.broadcast.emit("user status", {
      user: "Karu",
      status: "offline",
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
