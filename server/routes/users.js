const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/users/search?email=
// @desc    Search user by email (to add to project)
// @access  Private
router.get("/search", protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email query required" });

    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private/Admin
router.put("/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;