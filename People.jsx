import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";

export default function People() {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      api.people(q).then(setPeople).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const toggle = async (id) => {
    try {
      const updated = await api.toggleFollow(id);
      setPeople(people.map((p) => (p._id === id ? updated : p)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h2 className="page-title">Find people</h2>
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username" />
      {error && <p className="error">{error}</p>}
      {people.length === 0 && <p className="muted">No one found. Try a different name.</p>}
      {people.map((p) => (
        <div className="person" key={p._id}>
          <Avatar name={p.username} />
          <div className="person-info">
            <Link to={`/profile/${p._id}`} className="post-author">{p.username}</Link>
            <span className="muted">{p.bio || `${p.followerCount} followers`}</span>
          </div>
          <button className={p.isFollowing ? "btn-outline" : "btn"} onClick={() => toggle(p._id)}>
            {p.isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      ))}
    </>
  );
}
