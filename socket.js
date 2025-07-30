// socket.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;

    if (!user || !user._id) {
      console.log("❌ Invalid user tried to connect");
      socket.disconnect();
      return;
    }

    console.log(`✅ ${user.username} connected`);

    socket.on("join room", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("notification", {
        type: "USER_JOINED",
        message: `${user.username} joined the chat`,
      });

      // Send current users in room
      const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .map((id) => io.sockets.sockets.get(id)?.handshake.auth.user)
        .filter(Boolean);

      io.to(roomId).emit("users in room", usersInRoom);
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user left", user._id);
    });

    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      socket.to(groupId).emit("user stop typing", { username: user.username });
    });

    socket.on("new message", (message) => {
      io.to(message.groupId).emit("message received", message);
    });

    socket.on("disconnect", () => {
      console.log(`❌ ${user.username} disconnected`);
    });
  });
};
