import express from "express";
import {
  getOneProject,
  getProjects,
  updateProject,
  deleteCollaborator,
  deleteProject,
  addCollaborator,
  createProject,
  searchCollaborator,
} from "../controllers/projectContollers.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.route("/").get(checkAuth, getProjects).post(checkAuth, createProject);

router
  .route("/:id")
  .get(checkAuth, getOneProject)
  .put(checkAuth, updateProject)
  .delete(checkAuth, deleteProject);

router.post("/collaborators", checkAuth, searchCollaborator);

router.get("/tasks/:id", checkAuth);

router.post("/collaborators/:id", checkAuth, addCollaborator);

router.post("/delete-collaborator/:id", checkAuth, deleteCollaborator);

export default router;
