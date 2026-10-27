import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Feed from "./pages/Feed.jsx";
import People from "./pages/People.jsx";
import Profile from "./pages/Profile.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted center-note">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <div className={user ? "shell" : ""}>
      {user && <Navbar />}
      <main className={user ? "content" : ""}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<Protected><Feed /></Protected>} />
          <Route path="/people" element={<Protected><People /></Protected>} />
          <Route path="/profile/:id" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
