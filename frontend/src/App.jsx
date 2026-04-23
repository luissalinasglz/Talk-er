import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Login";
import TutorContainer from "./pages/tutor/tutor-container";
import AdminDashboard from "./pages/admin/admin-container";
import SupervisorDashboard from "./pages/supervisor/supervisor-container";
import StudentDashboard from "./pages/student/student-container";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Cada rol controla sus propias rutas internas */}
        <Route path="/tutor/*" element={<TutorContainer />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/supervisor/*" element={<SupervisorDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;