import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { _id: decoded.id, role: decoded.role, name: decoded.name };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);
    console.log(`🔌 Connected: ${socket.user.name}`);

    socket.on("join_room", ({ room }) => socket.join(room));
    socket.on("leave_room", ({ room }) => socket.leave(room));
    socket.on("disconnect", () =>
      console.log(`❌ Disconnected: ${socket.user.name}`),
    );
  });

  return io;
};

export const getIO = () => io;
