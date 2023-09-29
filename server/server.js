const io = require("socket.io")(8000);

const users = {};

io.on("connection", async (socket) => {
  socket.on("join-group", ({ user_name, groupId }) => {
    if (groupId && users[socket.id] == null) {
      socket.join(groupId);
      users[socket.id] = { user_name, groupId };
      socket.to(groupId).emit("user_joined", { user_name, groupId });
    }
  });

  socket.on("send-message", ({ groupId, message }) => {
    const user = users[socket.id];
    if (user) {
      socket
        .to(groupId)
        .emit("receive-message", { userId: user.user_name, message });
    }
  });

  socket.on("sender-typing", (message) => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.groupId).emit("message-typed", user.user_name, message);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];

    if (user) {
      socket.to(user.groupId).emit("user-left", user.user_name);
      delete users[socket.id];
    }
  });
});
