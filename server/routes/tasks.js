const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");

// Helper: check if user has access to a project
const hasProjectAccess = async (userId, projectId, adminRequired = false) => {
  const project = await Project.findById(projectId);
  if (!project) return { access: false, reason: "Project not found" };

  const isOwner = project.owner.toString() === userId.toString();
  const member = project.members.find((m) => m.user.toString() === userId.toString());
  const isAdmin = member?.role === "admin" || isOwner;

  if (adminRequired && !isAdmin) return { access: false, reason: "Admin access required" };
  if (!isOwner && !member) return { access: false, reason: "Not a project member" };

  return { access: true, project };
};

// @route   GET /api/tasks/my
// @desc    Get all tasks assigned to current user
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "name status")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/tasks/dashboard
// @desc    Get dashboard stats for current user
// @access  Private
router.get("/dashboard", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get projects accessible by user
    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    });
    const projectIds = projects.map((p) => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = await Task.find({ assignedTo: userId });
    const now = new Date();

    const overdueTasks = myTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== "done"
    );

    const statusBreakdown = {
      todo: allTasks.filter((t) => t.status === "todo").length,
      "in-progress": allTasks.filter((t) => t.status === "in-progress").length,
      review: allTasks.filter((t) => t.status === "review").length,
      done: allTasks.filter((t) => t.status === "done").length,
    };

    const priorityBreakdown = {
      high: allTasks.filter((t) => t.priority === "high").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      low: allTasks.filter((t) => t.priority === "low").length,
    };

    res.json({
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      overdueTasks: overdueTasks.length,
      statusBreakdown,
      priorityBreakdown,
      recentTasks: myTasks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project
// @access  Private
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { access, reason } = await hasProjectAccess(req.user._id, req.params.projectId);
    if (!access) return res.status(403).json({ message: reason });

    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.params.projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Title and project are required" });
    }

    const { access, reason } = await hasProjectAccess(req.user._id, project);
    if (!access) return res.status(403).json({ message: reason });

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority,
      dueDate,
      tags,
      createdBy: req.user._id,
    });

    await task.populate("assignedTo", "name email avatar");
    await task.populate("createdBy", "name email");

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { access, reason, project } = await hasProjectAccess(req.user._id, task.project);
    if (!access) return res.status(403).json({ message: reason });

    // Members can only update status of their assigned tasks
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isProjectAdmin = project.members.find(
      (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
    );
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isGlobalAdmin = req.user.role === "admin";

    if (!isAssigned && !isProjectAdmin && !isOwner && !isGlobalAdmin) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Members can only update status
    const allowedFields = isProjectAdmin || isOwner || isGlobalAdmin
      ? ["title", "description", "status", "priority", "assignedTo", "dueDate", "tags"]
      : ["status"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate("assignedTo", "name email avatar");
    await task.populate("createdBy", "name email");

    res.json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (project admin or task creator)
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const { access, project } = await hasProjectAccess(req.user._id, task.project);

    if (!access) return res.status(403).json({ message: "Access denied" });

    const isProjectAdmin = project.members.find(
      (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
    );

    if (!isCreator && !isProjectAdmin && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;