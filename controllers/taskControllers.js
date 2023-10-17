import Project from "../models/Project.js";
import Task from "../models/Task.js";

const createTask = async (req, res) => {
  const { project } = req.body;
  const isProjectExists = await Project.findById(project);
  if (!isProjectExists) {
    const error = new Error("Project doest not exist");
    res.status(404).json({ msg: error.message });
  } else if (isProjectExists.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid Credentials");
    res.status(404).json({ msg: error.message });
  }
  try {
    const storagedTask = await Task.create(req.body);
    // Save Id
    isProjectExists.tasks.push(storagedTask._id);
    await isProjectExists.save();
    res.json(storagedTask);
  } catch (error) {
    console.log(error);
  }
};
const getOneTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id).populate("project");
    if (!task) {
      const error = new Error("Task not exist");
      res.status(404).json({ msg: error.message });
    } else if (task.project.creator.toString() !== req.user._id.toString()) {
      const error = new Error("Invalid credentials");
      res.status(403).json({ msg: error.message });
    } else
      try {
        res.json(task);
      } catch (error) {
        console.log(error);
      }
  } catch (error) {
    res.status(404).json({ msg: "Task does not exist" });
  }
};
const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id).populate("project");
    if (!task) {
      const error = new Error("Task not exist");
      res.status(404).json({ msg: error.message });
    } else if (task.project.creator.toString() !== req.user._id.toString()) {
      const error = new Error("Invalid credentials");
      res.status(403).json({ msg: error.message });
    } else task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.deadline = req.body.deadline || task.deadline;
    try {
      const updatedTask = await task.save();
      res.json(updatedTask);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(404).json({ msg: "Task does not exist" });
  }
};
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id).populate("project");
    if (!task) {
      const error = new Error("Task does not exist");
      res.status(404).json({ msg: error.message });
    } else if (task.project.creator.toString() !== req.user._id.toString()) {
      const error = new Error("Invalid credentials");
      res.status(403).json({ msg: error.message });
    } else
      try {
        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);

        await Promise.allSettled([
          await project.save(),
          await task.deleteOne(),
        ]);

        res.json({ msg: "This task has been deleted" });
      } catch (error) {
        res.status(404).json({ msg: "Task does not exist" });
      }
  } catch (error) {}
};
const changeState = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate("project")
    .populate("completed");

  if (!task) {
    const error = new Error("Task does not exist");
    res.status(404).json({ msg: error.message });
  }
  if (
    task.project.creator.toString() !== req.user._id.toString() &&
    !task.project.collaborators.some(
      (collaborator) => collaborator._id.toString() === req.user._id.toString()
    )
  ) {
    const error = new Error("Invalid credentials");
    res.status(403).json({ msg: error.message });
  }
  task.state = !task.state;
  task.completed = req.user._id;
  await task.save();
  const storagedTask = await Task.findById(id)
    .populate("project")
    .populate("completed");

  return res.json(storagedTask);
};

export { createTask, changeState, updateTask, getOneTask, deleteTask };
