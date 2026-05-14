import { useEffect, useState } from "react";
import "./supervisor-dashboard.css";

function Dashboard() {

  const [groups, setGroups] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    page();
  }, []);

  async function page() {
    try {
      const res = await fetch(`${API_URL}/supervisor/super`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data)
        console.log("HOLA");
      }
    } catch (error) {
      console.log("Error al cargar grupos", error);
    }
  }

  return (
    <div className="dashboardsupervisor">
      <div className="supervisor-content">

        <div className="dashboard-left">
          <div className="widgets">

            <div className="wid-side">
              <div className="wid">
                <p>Tutores</p>
                <h2>3</h2>
                <p>Bajo supervición</p>
              </div>
              <div className="wid">
                <p>Bitácoras</p>
                <h2>5</h2>
                <p>Por revisar</p>
              </div>
            </div>

            <div className="wid-side">
              <div className="wid">
                <p>Tutores</p>
                <h2>3</h2>
                <p>Bajo supervición</p>
              </div>
              <div className="wid">
                <p>Bitácoras</p>
                <h2>5</h2>
                <p>Por revisar</p>
              </div>
            </div>

          </div>
          <div className="supervise">
            <h2>Tutores Supervisados</h2>
            {[
              { nombre: "Harry Potter", clase: "Inglés B", sesiones: 12, bitacoras: 12, incidencias: 1 },
              { nombre: "Hermione Granger", clase: "Frances A", sesiones: 10, bitacoras: 8, incidencias: 2 },
              { nombre: "Ron Weasley", clase: "Inglés A", sesiones: 8, bitacoras: 6, incidencias: 2 },
            ].map((tutor, i) => (
              <div key={i} className="tutor-row">
                <div className="circle-supervise"></div>
                <div className="tutor-name-info">
                  <p className="tutor-name">{tutor.nombre}</p>
                  <p className="tutor-class">{tutor.clase}</p>
                </div>
                <div className="tutor-stat">
                  <p>Sesiones</p>
                  <h4>{tutor.sesiones}</h4>
                </div>
                <div className="tutor-stat">
                  <p>Bitácoras</p>
                  <h4>{tutor.bitacoras}</h4>
                </div>
                <div className="tutor-stat">
                  <p>Incidencias</p>
                  <h4>{tutor.incidencias}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-right">
          <h2>Pendientes de revisión</h2>
          <div className="right-data">

            <div className="revision-data">
              <div className="circle-data"></div>
              <div className="revision-datainfo">
                <h4>Asistencias sin validar</h4>
                <p>Roberto Castro</p>
              </div>
            </div>

            <div className="revision-data">
              <div className="circle-data"></div>
              <div className="revision-datainfo">
                <h4>Bitácora sin revisar</h4>
                <p>Luis Salinas</p>
              </div>
            </div>

            <div className="revision-data">
              <div className="circle-data"></div>
              <div className="revision-datainfo">
                <h4>Bitácora sin revisar</h4>
                <p>Roberto Castro</p>
              </div>
            </div>

            <div className="revision-data">
              <div className="circle-data"></div>
              <div className="revision-datainfo">
                <h4>Incidencia registrada</h4>
                <p>Roberto Castro</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );

}

export default Dashboard
