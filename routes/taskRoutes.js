import express from "express";
import {
  createTask,
  changeState,
  updateTask,
  getOneTask,
  deleteTask,
} from "../controllers/taskControllers.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.post("/", checkAuth, createTask);
router
  .route("/:id")
  .get(checkAuth, getOneTask)
  .put(checkAuth, updateTask)
  .delete(checkAuth, deleteTask);
router.post("/state/:id", checkAuth, changeState);

export default router;
