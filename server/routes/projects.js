const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  projectMemberOnly,
  projectAdminOnly,
} = require("../middleware/roleCheck");

router.get("/", protect, async (req, res) => {
  try {
    const projects =
      req.user.role === "admin"
        ? await Project.find({})
        : await Project.find({
            $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
          })
            .populate("owner", "name email avatar")
            .populate("members.user", "name email avatar")
            .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      deadline,
      status,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await project.populate("owner", "name email avatar");
    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private (members only)
router.get("/:id", protect, projectMemberOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    const tasks = await Task.find({ project: req.params.id })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email");

    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (project admin only)
router.put("/:id", protect, projectAdminOnly, async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline, status },
      { new: true, runValidators: true },
    )
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.json({ message: "Project updated", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (and all its tasks)
// @access  Private (owner only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only owner can delete a project" });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: "Project and all its tasks deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (project admin)
router.post(
  "/:projectId/members",
  protect,
  projectAdminOnly,
  async (req, res) => {
    try {
      const { email, role } = req.body;

      const userToAdd = await User.findOne({ email });
      if (!userToAdd)
        return res.status(404).json({ message: "User not found" });

      const project = req.project;
      const alreadyMember = project.members.some(
        (m) => m.user.toString() === userToAdd._id.toString(),
      );

      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }

      project.members.push({ user: userToAdd._id, role: role || "member" });
      await project.save();
      await project.populate("members.user", "name email avatar");

      res.json({ message: "Member added", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

// @route   DELETE /api/projects/:projectId/members/:userId
// @desc    Remove member from project
// @access  Private (project admin)
router.delete(
  "/:projectId/members/:userId",
  protect,
  projectAdminOnly,
  async (req, res) => {
    try {
      const project = req.project;

      if (project.owner.toString() === req.params.userId) {
        return res.status(400).json({ message: "Cannot remove project owner" });
      }

      project.members = project.members.filter(
        (m) => m.user.toString() !== req.params.userId,
      );
      await project.save();

      res.json({ message: "Member removed", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
