import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Avatar from "./Avatar.jsx";
import timeAgo from "./timeAgo.js";

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const mine = user._id === post.author._id;

  const like = async () => {
    try {
      const r = await api.toggleLike(post._id);
      setLiked(r.liked);
      setLikeCount(r.likeCount);
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleComments = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setComments(await api.comments(post._id));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await api.addComment(post._id, text);
      setComments([...comments, c]);
      setCommentCount(commentCount + 1);
      setText("");
      setError("");
    } catch (e2) {
      setError(e2.message);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deletePost(post._id);
      onDeleted?.(post._id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <article className="post">
      <Avatar name={post.author.username} />
      <div className="post-body">
        <header className="post-head">
          <Link to={`/profile/${post.author._id}`} className="post-author">
            {post.author.username}
          </Link>
          <span className="muted">{timeAgo(post.createdAt)}</span>
          {mine && (
            <button className="btn-quiet post-delete" onClick={remove}>
              Delete
            </button>
          )}
        </header>
        <p className="post-text">{post.text}</p>

        <div className="post-actions">
          <button className={`action ${liked ? "on" : ""}`} onClick={like} aria-pressed={liked}>
            {liked ? "Liked" : "Like"} · {likeCount}
          </button>
          <button className="action" onClick={toggleComments} aria-expanded={open}>
            Comments · {commentCount}
          </button>
        </div>

        {open && (
          <div className="comments">
            {comments.length === 0 && <p className="muted">No comments yet. Start the conversation.</p>}
            {comments.map((c) => (
              <div className="comment" key={c._id}>
                <Link to={`/profile/${c.author._id}`} className="post-author">
                  {c.author.username}
                </Link>
                <span>{c.text}</span>
              </div>
            ))}
            <form className="comment-form" onSubmit={addComment}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment"
                maxLength={300}
              />
              <button className="btn" disabled={!text.trim()}>Comment</button>
            </form>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </article>
  );
}
