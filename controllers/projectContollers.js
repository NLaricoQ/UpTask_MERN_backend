import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ collaborators: { $in: req.user } }, { creator: { $in: req.user } }],
  }).select("-tasks");
  res.json(projects);
};
const createProject = async (req, res) => {
  const project = new Project(req.body);
  project.creator = req.user._id;
  try {
    const storagedProject = await project.save();
    res.json(storagedProject);
  } catch (error) {
    console.log(error);
  }
};

const getOneProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id)
      .populate({
        path: "tasks",
        populate: { path: "completed", select: "name" },
      })
      .populate("collaborators", "name email");
    if (!project) {
      const error = new Error("Project not found");
      res.status(400).json({ msg: error.message });
    } else if (
      project.creator.toString() !== req.user._id.toString() &&
      !project.collaborators.some(
        (collaborator) =>
          collaborator._id.toString() === req.user._id.toString()
      )
    ) {
      const error = new Error("You dont have credentials");
      res.status(401).json({ msg: error.message });
    } else {
      // Get task of one proyect
      res.json(project);
    }
  } catch (error) {
    res.status(404).json({ msg: "Project does not exist" });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      const error = new Error("Project does not exist");
      res.status(400).json({ msg: error.message });
    } else if (project.creator.toString() !== req.user._id.toString()) {
      const error = new Error("You dont have credentials");
      res.status(401).json({ msg: error.message });
    }
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deadline = req.body.deadline || project.deadline;
    project.customer = req.body.customer || project.customer;
    try {
      const updatedProject = await project.save();
      res.json(updatedProject);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(404).json({ msg: "Project does not exist" });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      const error = new Error("Project does not exist");
      res.status(400).json({ msg: error.message });
    } else if (project.creator.toString() !== req.user._id.toString()) {
      const error = new Error("You dont have credentials");
      res.status(401).json({ msg: error.message });
    } else
      try {
        await project.deleteOne();
        res.json({ msg: "Project deleted" });
      } catch (error) {
        console.log(error);
      }
  } catch (error) {
    res.status(404).json({ msg: "Project does not exist" });
  }
};
const searchCollaborator = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select(
    "-confirmed -createdAt -password -token -updatedAt -__v"
  );
  if (!user) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }
  res.json(user);
};
const addCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }
  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid credentials");
    return res.status(404).json({ msg: error.message });
  }
  const { email } = req.body;
  const user = await User.findOne({ email }).select(
    "-confirmed -createdAt -password -token -updatedAt -__v"
  );
  // The user exists
  if (!user) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }
  // A collaborator isnt the Project Manager
  if (project.creator.toString() === user._id.toString()) {
    const error = new Error("The creator cannot be collaborator");
    return res.status(404).json({ msg: error.message });
  }
  //Check if collaborator is already in the project
  if (project.collaborators.includes(user._id)) {
    const error = new Error("The user already belongs to this project ");
    return res.status(404).json({ msg: error.message });
  }
  // If all good, can add
  project.collaborators.push(user._id);
  await project.save();
  res.json({ msg: "Collaborator added successfully" });
};

const deleteCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    const error = new Error("Project not found");
    return res.status(404).json({ msg: error.message });
  }
  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid credentials");
    return res.status(404).json({ msg: error.message });
  }

  // If all good, can delete
  project.collaborators.pull(req.body.id);

  await project.save();
  res.json({ msg: "Collaborator deleted successfully" });
};

export {
  getOneProject,
  getProjects,
  updateProject,
  deleteCollaborator,
  deleteProject,
  addCollaborator,
  createProject,
  searchCollaborator,
};
