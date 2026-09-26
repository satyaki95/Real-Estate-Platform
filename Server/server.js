import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

// Import all route modules so the API can expose endpoints for auth,
// users, properties, inquiries, chat, and admin actions.
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import contactRouter from "./routes/contact.routes.js";
import adminRouter from "./routes/admin.routes.js";
import chatRouter from "./routes/chat.routes.js";
import maintenanceRouter from "./routes/maintenance.routes.js";
import amenityBookingRouter from "./routes/amenityBooking.routes.js";

// Main Express server for the Real Estate Platform.
// This file wires together the database connection, all API routes,
// CORS configuration, and the Socket.IO layer used for chat and live updates.
const app = express();
const PORT = 5000;

// Establish the MongoDB connection as soon as the backend starts.
connectDB();

// Restrict cross-origin requests to the frontend URL configured in the environment.
// This helps prevent unauthorized access from other frontends while allowing
// the React app to call the API during local development and production hosting.
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(","),
  "https://real-estate-flax-xi-51.vercel.app",
]
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Register all backend route groups under a versioned-like API namespace.
// Each router handles a specific feature area such as auth, property listings,
// admin approval, inquiries, or chat-related operations.
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/property", propertyRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/amenity-bookings", amenityBookingRouter);

// Basic health check endpoint for quick server verification.
app.get("/", (req, res) => {
  res.send("API WORKING");
});

const server = http.createServer(app);

// Socket.IO enables real-time communication for chat rooms and live updates.
// The backend stores the socket server on Express so controllers or routes can
// emit events to specific users or conversation channels when needed.
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  // Join a user-specific room so notifications can be sent to one user only.
  socket.on("joinUser", ({ userId, role }) => {
    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
  });

  // Join a specific conversation room for chat messaging.
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  // Broadcast a sent message to all users in that chat room.
  socket.on("sendMessage", (data) => {
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});
