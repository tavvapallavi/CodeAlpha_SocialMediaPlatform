import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  const mine = user._id === id;

  useEffect(() => {
    setProfile(null);
    setError("");
    Promise.all([api.profile(id), api.userPosts(id)])
      .then(([p, ps]) => {
        setProfile(p);
        setBio(p.bio);
        setPosts(ps);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const follow = async () => {
    try {
      setProfile(await api.toggleFollow(id));
    } catch (e) {
      setError(e.message);
    }
  };

  const saveBio = async () => {
    try {
      const u = await api.updateBio(bio);
      setUser(u);
      setProfile({ ...profile, bio: u.bio });
      setEditing(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !profile) return <p className="error">{error}</p>;
  if (!profile) return <p className="muted">Loading profile…</p>;

  return (
    <>
      <section className="profile-head">
        <Avatar name={profile.username} size={72} />
        <div className="profile-main">
          <h2>{profile.username}</h2>
          {editing ? (
            <>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2} placeholder="Write a short bio" />
              <div className="row">
                <button className="btn" onClick={saveBio}>Save bio</button>
                <button className="btn-outline" onClick={() => { setEditing(false); setBio(profile.bio); }}>Cancel</button>
              </div>
            </>
          ) : (
            <p className={profile.bio ? "" : "muted"}>{profile.bio || (mine ? "Add a short bio so people know you." : "No bio yet.")}</p>
          )}
          <div className="counts">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followerCount}</strong> followers</span>
            <span><strong>{profile.followingCount}</strong> following</span>
          </div>
        </div>
        {mine ? (
          !editing && <button className="btn-outline" onClick={() => setEditing(true)}>Edit bio</button>
        ) : (
          <button className={profile.isFollowing ? "btn-outline" : "btn"} onClick={follow}>
            {profile.isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </section>
      {error && <p className="error">{error}</p>}

      <h3 className="section-title">Posts</h3>
      {posts.length === 0 && <p className="muted">{mine ? "You haven't posted yet." : "No posts yet."}</p>}
      {posts.map((p) => (
        <PostCard key={p._id} post={p} onDeleted={(pid) => setPosts(posts.filter((x) => x._id !== pid))} />
      ))}
    </>
  );
}
