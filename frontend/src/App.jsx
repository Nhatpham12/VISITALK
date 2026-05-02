import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/login" element={<Login />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/asking" element={<Asking />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/report" element={<Report />} />
        <Route path="/securitypolicy" element={<Securitypolicy />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/termofser" element={<Termofser />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
