import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

const card = (u, me) => ({
  _id: u._id,
  username: u.username,
  bio: u.bio,
  followerCount: u.followers.length,
  followingCount: u.following.length,
  isFollowing: u.followers.some((f) => f.equals(me)),
});

// Find people to follow. Optional ?q= filters by username.
router.get("/", auth, async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = { _id: { $ne: req.userId } };
    if (q) filter.username = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json(users.map((u) => card(u, req.userId)));
  } catch (err) {
    next(err);
  }
});

// Update own bio
router.put("/me", auth, async (req, res, next) => {
  try {
    const bio = (req.body.bio || "").slice(0, 160);
    const user = await User.findByIdAndUpdate(req.userId, { bio }, { new: true });
    res.json({ _id: user._id, username: user.username, email: user.email, bio: user.bio });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ message: "Profile not found." });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Profile not found." });
    res.json({ ...card(user, req.userId), joined: user.createdAt });
  } catch (err) {
    next(err);
  }
});

// Follow / unfollow (toggle)
router.post("/:id/follow", auth, async (req, res, next) => {
  try {
    if (req.params.id === req.userId)
      return res.status(400).json({ message: "You can't follow yourself." });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Profile not found." });

    const already = target.followers.some((f) => f.equals(req.userId));
    if (already) {
      await User.updateOne({ _id: target._id }, { $pull: { followers: req.userId } });
      await User.updateOne({ _id: req.userId }, { $pull: { following: target._id } });
    } else {
      await User.updateOne({ _id: target._id }, { $addToSet: { followers: req.userId } });
      await User.updateOne({ _id: req.userId }, { $addToSet: { following: target._id } });
    }
    const fresh = await User.findById(target._id);
    res.json(card(fresh, req.userId));
  } catch (err) {
    next(err);
  }
});

export default router;
