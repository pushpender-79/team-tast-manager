const Project = require("../models/Project");

// Only allow admins (global role)
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Check if user is project owner or admin member of the project
const projectAdminOnly = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.body.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isProjectAdmin = project.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
    );
    const isGlobalAdmin = req.user.role === "admin";

    if (!isOwner && !isProjectAdmin && !isGlobalAdmin) {
      return res.status(403).json({ message: "Access denied. Project admin required." });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is a member of the project
const projectMemberOnly = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId || req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isGlobalAdmin = req.user.role === "admin";

    if (!isOwner && !isMember && !isGlobalAdmin) {
      return res.status(403).json({ message: "Access denied. Not a project member." });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { adminOnly, projectAdminOnly, projectMemberOnly };