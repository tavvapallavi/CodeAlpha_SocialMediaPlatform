import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import PostCard from "../components/PostCard.jsx";

export default function Feed() {
  const [tab, setTab] = useState("following");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    (tab === "following" ? api.feed() : api.explore())
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  const publish = async (e) => {
    e.preventDefault();
    try {
      const post = await api.createPost(text);
      setPosts([post, ...posts]);
      setText("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form className="composer" onSubmit={publish}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={500}
          rows={3}
        />
        <div className="composer-foot">
          <span className="muted">{text.length}/500</span>
          <button className="btn" disabled={!text.trim()}>Post</button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "following"} className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
          Following
        </button>
        <button role="tab" aria-selected={tab === "everyone"} className={tab === "everyone" ? "active" : ""} onClick={() => setTab("everyone")}>
          Everyone
        </button>
      </div>

      {loading && <p className="muted">Loading posts…</p>}
      {!loading && posts.length === 0 && (
        <div className="empty">
          <p>
            {tab === "following"
              ? "Nothing here yet. Follow people to see their posts."
              : "No posts yet. Be the first to write one."}
          </p>
          {tab === "following" && <Link to="/people" className="btn">Find people</Link>}
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p._id} post={p} onDeleted={(id) => setPosts(posts.filter((x) => x._id !== id))} />
      ))}
    </>
  );
}
