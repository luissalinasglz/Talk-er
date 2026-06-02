import { Routes, Route, Navigate} from "react-router-dom";
import SidebarStudent from "./student-sidebar";
import Dashboard from "./student-dashboard";

import StudentSesiones from "./student-sesiones";
import StudentTareas  from "./student-tareas";
import StudentExamenes from "./student-examenes";
import StudentMaterial from "./student-material";
import Header from "../../header";
import "./student-container.css";

function StudentContainer() {
  return (
    <div className="student-layout">
      <SidebarStudent />
      <Header/>

      <div className="student-main">

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="sesiones" element={<StudentSesiones />} />
          <Route path="tareas" element={<StudentTareas />} />
          <Route path="examenes" element={<StudentExamenes />} />
          <Route path="material" element={<StudentMaterial />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default StudentContainer;