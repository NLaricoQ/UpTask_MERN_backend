import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json());
dotenv.config();

connectDB();

//*Set CORS
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error"));
    }
  },
};
app.use(cors(corsOptions));

//* Routing

app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//* Socket.io

import { Server } from "socket.io";

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Connecting to SOCKET.IO");
  // Events
  socket.on("Open Project", (project) => {
    socket.join(project);
  });
  socket.on("New Task", (task) => {
    const project = task.project;
    socket.to(project).emit("Added Task", task);
  });
  socket.on("Delete Task", (task) => {
    const project = task.project;
    socket.to(project).emit("Deleted Task", task);
  });
  socket.on("Edit Task", (task) => {
    const project = task.project._id;
    socket.to(project).emit("Updated Task", task);
  });
  socket.on("Change State", (task) => {
    const project = task.project._id;
    socket.to(project).emit("New State", task);
  });
});
