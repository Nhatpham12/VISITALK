// frontend/src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Learning from "./pages/Learning";
import Login from "./pages/Login";
import Personal from "./pages/Personal";
import Admin from "./pages/Admin";
import Asking from "./pages/Asking";
import Introduce from "./pages/Introduce";
import Report from "./pages/Report";
import Securitypolicy from "./pages/Securitypolicy";
import Setting from "./pages/Setting";
import Signup from "./pages/Signup";
import Termofser from "./pages/Termofser";
import Translate from "./pages/Translate";
import Welcome from "./pages/Welcome";
import Greeting from "./pages/Greeting";
import Alphabet from "./pages/Alphabet";
import Numbers from "./pages/Numbers";

// Guard ngược: đã login thì không vào /login /signup /welcome được nữa
function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;

  if (user) {
    const fallbackRedirect = user.u_role === "admin" ? "/admin" : "/";
    return <Navigate to={location.state?.from || fallbackRedirect} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — ai cũng xem được */}
          <Route path="/" element={<Home />} />
          <Route path="/introduce" element={<Introduce />} />
          <Route path="/securitypolicy" element={<Securitypolicy />} />
          <Route path="/termofser" element={<Termofser />} />

          {/* Chỉ khi CHƯA đăng nhập */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/welcome"
            element={
              <PublicOnlyRoute>
                <Welcome />
              </PublicOnlyRoute>
            }
          />

          {/* Cần đăng nhập */}
          <Route
            path="/personal"
            element={
              <ProtectedRoute>
                <Personal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute>
                <Setting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asking"
            element={
              <ProtectedRoute>
                <Asking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/translate"
            element={
              <ProtectedRoute>
                <Translate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <Learning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/greeting"
            element={
              <ProtectedRoute>
                <Greeting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/alphabet"
            element={
              <ProtectedRoute>
                <Alphabet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/numbers"
            element={
              <ProtectedRoute>
                <Numbers />
              </ProtectedRoute>
            }
          />

          {/* Chỉ admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="main-content" style={{ textAlign: "center", padding: "80px 20px" }}>
                <h1 style={{ fontSize: 72, color: "#1a2a4a" }}>404</h1>
                <p style={{ fontSize: 20, color: "#374c72" }}>Trang không tồn tại</p>
                <a href="/" style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "#1a2a4a", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
                  Về trang chủ
                </a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
