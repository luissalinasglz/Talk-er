import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Login";
import TutorContainer from "./pages/tutor/tutor-container";
import AdminDashboard from "./pages/admin/admin-container";
import SupervisorDashboard from "./pages/supervisor/supervisor-container";
import StudentDashboard from "./pages/student/student-container";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />

        {/* Cada rol controla sus propias rutas internas */}
        <Route path="/tutor/*" element={
          <ProtectedRoute allowedRole="teacher">
            <TutorContainer />
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/supervisor/*" element={
          <ProtectedRoute allowedRole="supervisor">
            <SupervisorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student/*" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
