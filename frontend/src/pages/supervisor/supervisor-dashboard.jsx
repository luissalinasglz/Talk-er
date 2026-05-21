import { useEffect, useState } from "react";
import "./supervisor-dashboard.css";

function Dashboard() {
  const [tutores, setTutores] = useState([]);
  const [bitacoras, setBitacoras] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tutoresRes, bitacorasRes] = await Promise.all([
        fetch(`${API_URL}/supervisor/tutors`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${API_URL}/supervisor/bitacoras`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      ]);
      
      const tutoresData = await tutoresRes.json();
      const bitacorasData = await bitacorasRes.json();
      
      setTutores(tutoresData);
      setBitacoras(bitacorasData);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  };

  const totalTutores = tutores.length;
  const totalBitacorasPendientes = bitacoras.length;

  const totalSesiones = tutores.reduce(
    (acc, tutor) => acc + Number(tutor.total_sessions || 0),
    0
  );

  const totalIncidencias = tutores.reduce(
    (acc, tutor) => acc + Number(tutor.total_incidences || 0),
    0
  );
  
  const formatIdioma = (idioma) => {
    if (!idioma) return "Idioma";
    
    const strIdioma = String(idioma).toLowerCase(); 
    
    if (strIdioma.includes("english")) return "Inglés";
    if (strIdioma.includes("french")) return "Francés";
    
    if (strIdioma.includes("english,french") || strIdioma.includes("french,english")) {
      return "Inglés / Francés";
    }

    return idioma;
  };

  return (
    <div className="dashboardsupervisor">
      <div className="supervisor-content">
        <div className="dashboard-left">
          <div className="widgets">
            <div className="wid-side">
              <div className="wid">
                <p>Tutores</p>
                <h2>{totalTutores}</h2>
                <p>Bajo supervisión</p>
              </div>
              <div className="wid">
                <p>Bitácoras</p>
                <h2>{totalBitacorasPendientes}</h2>
                <p>Por revisar</p>
              </div>
            </div>

            <div className="wid-side">
              <div className="wid">
                <p>Sesiones</p>
                <h2>{totalSesiones}</h2>
                <p>Registradas</p>
              </div>
              <div className="wid">
                <p>Incidencias</p>
                <h2>{totalIncidencias}</h2>
                <p>Reportadas</p>
              </div>
            </div>
          </div>

          <div className="supervise">
            <h2>Tutores Supervisados</h2>
            {tutores.map((tutor) => (
              <div
                key={tutor.tutor_id}
                className="tutor-row"
              >
                <div className="circle-supervise"></div>
                <div className="tutor-name-info">
                  <p className="tutor-name">
                    {tutor.tutor_name}
                  </p>
                  <p className="tutor-class">
                    {/* CORRECCIÓN: Llamamos a tutor.idioma (singular) dependiendo del backend */}
                    {formatIdioma(tutor.idioma)}
                  </p>
                </div>
                <div className="tutor-stat">
                  <p>Sesiones</p>
                  <h4>{tutor.total_sessions}</h4>
                </div>
                <div className="tutor-stat">
                  <p>Bitácoras</p>
                  <h4>{tutor.total_logs}</h4>
                </div>
                <div className="tutor-stat">
                  <p>Incidencias</p>
                  <h4>{tutor.total_incidences}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-right">
          <h2>Pendientes de revisión</h2>
          <div className="right-data">
            {bitacoras.length === 0 ? (
              <p>No hay pendientes por revisar</p>
            ) : (
              bitacoras.map((bitacora) => (
                <div
                  key={bitacora.id}
                  className="revision-data"
                >
                  <div className="circle-data"></div>
                  <div className="revision-datainfo">
                    <h4>
                      {bitacora.incidence
                        ? "Incidencia registrada"
                        : "Bitácora sin revisar"}
                    </h4>
                    <p>
                      Sesión #{bitacora.session_id}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;