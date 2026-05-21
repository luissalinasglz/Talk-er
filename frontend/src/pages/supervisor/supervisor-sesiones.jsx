import "./supervisor-sesiones.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Importamos para la navegación

function SupervisorSesiones() {
    const [tutores, setTutores] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [sesiones, setSesiones] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate(); // <-- Inicializamos el hook de navegación

    useEffect(() => {
        fetchTutores();
    }, []);

    useEffect(() => {
        if (selectedTutor) {
            fetchSesiones(selectedTutor.tutor_id);
        }
    }, [selectedTutor]);

    const fetchTutores = async () => {
        try {
            const response = await fetch(`${API_URL}/supervisor/tutors`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });

            const data = await response.json();
            setTutores(data);
            if (data.length > 0) {
                setSelectedTutor(data[0]);
            }

        } catch (error) {
            console.error("Error al obtener tutores:", error);
        }
    };

    const fetchSesiones = async (tutorId) => {
        try {
            const response = await fetch(`${API_URL}/supervisor/tutor/${tutorId}/sessions`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await response.json();
            setSesiones(data);
        } catch (error) {
            console.error("Error al obtener sesiones:", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
        });
    };

    const formatDay = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            weekday: "long",
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatIdioma = (idioma) => {
        if (!idioma) return "Clase";
        const strIdioma = String(idioma).toLowerCase();
        if (strIdioma.includes("english")) return "Inglés";
        if (strIdioma.includes("french")) return "Francés";
        if (strIdioma.includes("english,french") || strIdioma.includes("french,english")) return "Inglés / Francés";
        return idioma;
    };

    const handleRevisarBitacora = () => {
        navigate("/supervisor/bitacora"); 
    };

    return (
        <div className="sesiones-supervisor">
            <div className="sessions-line"></div>

            <div className="sessions">
                <div className="sessions-left">
                    <h2>Tutores</h2>
                    {tutores.map((tutor) => (
                        <div key={tutor.tutor_id} className={`tutor-info ${selectedTutor?.tutor_id === tutor.tutor_id ? "select" : ""}`} onClick={() => setSelectedTutor(tutor)} >
                            <h4>{tutor.tutor_name}</h4>
                            <p> {tutor.total_sessions} sesiones </p>
                        </div>
                    ))}
                </div>

                <div className="sessions-right">
                    
                    {selectedTutor && (<>
                        <div className="tutor-generalinfo">
                            <div className="data-info">
                                <h2>{selectedTutor.tutor_name}</h2>
                                <p> Período{" "} {formatDate(selectedTutor.period_start)} {" - "} {formatDate(selectedTutor.period_end)} </p>
                            </div>
                            <div className="numeric-data">
                                <h3>{selectedTutor.total_sessions}</h3>
                                <p>Sesiones</p>
                            </div>
                            <div className="numeric-data">
                                <h3>{selectedTutor.total_logs}</h3>
                                <p>Bitácoras</p>
                            </div>
                            <div className="numeric-data">
                                <h3>{selectedTutor.total_incidences}</h3>
                                <p>Incidencias</p>
                            </div>
                        </div>

                        <div className="validated-info">
                            <h3>Sesiones</h3>
                            {sesiones.map((sesion) => (
                                <div className="sessionday" key={sesion.session_id}>
                                    <div className="date">
                                        <p> {formatDay(sesion.start_time)} </p>
                                        <h4> {formatDate(sesion.start_time)} </h4>
                                    </div>

                                    <div className="sessionday-info">
                                        <h4> {formatIdioma(sesion.idioma)} </h4>
                                        <h4> Sesión {sesion.session_id} </h4>
                                        <p> {formatTime(sesion.start_time)} {" - "} {formatTime(sesion.end_time)}
                                        </p>
                                    </div>

                                    {(!sesion.validated && !sesion.approved) ? (
                                        // 1. (F, F) -> No la ha hecho o se mandó a corrección
                                        <div className="pen" style={{ opacity: 0.6, cursor: "not-allowed" }} title="El tutor aún no envía esta bitácora">
                                            <p> Sin Bitácora </p>
                                        </div>
                                    ) : (sesion.validated && !sesion.approved) ? (
                                        // 2. (T, F) -> El tutor la envió, hay que revisarla
                                        <div 
                                            className="pen clickable-pen" 
                                            onClick={handleRevisarBitacora}
                                            title="Ir a revisar bitácoras"
                                        >
                                            <p> Bitácora Pendiente </p>
                                        </div>
                                    ) : (
                                        // 3. (T, T) -> Validada y aprobada
                                        <div className="val">
                                            <p> Bitácora Validada </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    );
}

export default SupervisorSesiones;