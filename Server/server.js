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

// Start the database connection once and wait for it before handling requests.
const databaseConnection = connectDB();

// Restrict cross-origin requests to the frontend URL configured in the environment.
// This helps prevent unauthorized access from other frontends while allowing
// the React app to call the API during local development and production hosting.
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [`${clientUrl}`].filter(Boolean);
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
app.use(async (req, res, next) => {
  try {
    await databaseConnection;
    next();
  } catch (error) {
    next(error);
  }
});

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

app.set("io", null);

// Vercel serves the exported Express app as a serverless function. Persistent
// Socket.IO connections are only started in the local Node.js server.
if (process.env.VERCEL !== "1") {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });
  app.set("io", io);

  io.on("connection", (socket) => {
    socket.on("joinUser", ({ userId, role }) => {
      if (userId) socket.join(`user:${userId}`);
      if (role) socket.join(`role:${role}`);
    });

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.chatId).emit("receiveMessage", data);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
  });
}

export default app;
