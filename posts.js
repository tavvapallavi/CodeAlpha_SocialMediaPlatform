import { Router } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

const postJson = (p, me) => ({
  _id: p._id,
  text: p.text,
  author: { _id: p.author._id, username: p.author.username },
  likeCount: p.likes.length,
  liked: p.likes.some((l) => l.equals(me)),
  commentCount: p.commentCount,
  createdAt: p.createdAt,
});

const commentJson = (c) => ({
  _id: c._id,
  text: c.text,
  author: { _id: c.author._id, username: c.author.username },
  createdAt: c.createdAt,
});

const list = async (filter, me) => {
  const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(50).populate("author", "username");
  return posts.map((p) => postJson(p, me));
};

router.post("/", auth, async (req, res, next) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Write something before posting." });
    if (text.length > 500) return res.status(400).json({ message: "Posts can be up to 500 characters." });
    const post = await Post.create({ author: req.userId, text });
    await post.populate("author", "username");
    res.status(201).json(postJson(post, req.userId));
  } catch (err) {
    next(err);
  }
});

// Posts from people you follow, plus your own
router.get("/feed", auth, async (req, res, next) => {
  try {
    const me = await User.findById(req.userId);
    res.json(await list({ author: { $in: [...me.following, me._id] } }, req.userId));
  } catch (err) {
    next(err);
  }
});

// Everyone's posts
router.get("/explore", auth, async (req, res, next) => {
  try {
    res.json(await list({}, req.userId));
  } catch (err) {
    next(err);
  }
});

router.get("/user/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.json([]);
    res.json(await list({ author: req.params.id }, req.userId));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.author.equals(req.userId))
      return res.status(403).json({ message: "You can only delete your own posts." });
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

// Like / unlike (toggle)
router.post("/:id/like", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const liked = post.likes.some((l) => l.equals(req.userId));
    if (liked) post.likes.pull(req.userId);
    else post.likes.push(req.userId);
    await post.save();
    res.json({ liked: !liked, likeCount: post.likes.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/comments", auth, async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate("author", "username");
    res.json(comments.map(commentJson));
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", auth, async (req, res, next) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Write a comment first." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const comment = await Comment.create({ post: post._id, author: req.userId, text });
    post.commentCount += 1;
    await post.save();
    await comment.populate("author", "username");
    res.status(201).json(commentJson(comment));
  } catch (err) {
    next(err);
  }
});

export default router;
