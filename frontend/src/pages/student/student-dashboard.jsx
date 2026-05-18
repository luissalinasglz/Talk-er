import "./student-dashboard.css";
import profileWhite from "../../assets/profile-white.png";

function Dashboard() {
    return(
        <div className="dashboard-student">
            <div className="student-left">
                <div className="groups-rectangles">
                    <h2>Tus Clases</h2>
                    <div className="general-student-rectangles">
                        <div className="group-rectangle">
                            <h3>Inglés</h3>
                            <div className="tutor-details">
                                <p>Profesor:</p>
                                <p>Harry Potter</p>
                            </div>
                        </div>
                        <div className="group-rectangle">
                            <h3>Frances</h3>
                            <div className="tutor-details">
                                <p>Profesor:</p>
                                <p>Hermione Granger</p>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="next-sent">
                    <h2>Próximas Entregas</h2>
                    <div className="lessons-student">
                        <div className="circle-student-red"></div>
                        <div className="lesson-sent-detail">
                            <h4>Lección del Verbo to be</h4>
                            <p>Inglés</p>
                            <p>Se entrega hoy a las 11:59 p.m.</p>
                        </div>
                    </div>
                    <div className="lessons-student">
                        <div className="circle-student-orange"></div>
                        <div className="lesson-sent-detail">
                            <h4>Examen Vocabulario</h4>
                            <p>Inglés</p>
                            <p>Se entrega mañana a las 5:59 p.m.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="student-right">
                <div className="hour-student">
                    <h2>Horario</h2>
                    <div className="schedule-grid">
                        {["2:00", "3:00", "4:00", "5:00", "6:00", "7:00"].map((hour) => (
                            <div key={hour} className="schedule-row">
                                <span className="schedule-hour">{hour}</span>
                                <div className="schedule-slot">
                                    {hour === "3:00" && (
                                        <div className="schedule-event event-english">
                                            <p className="event-title">Inglés (Grupo/Nivel)</p>
                                            <p className="event-time">3:10 - 4:50 p.m.</p>
                                        </div>
                                    )}
                                    {hour === "6:00" && (
                                        <div className="schedule-event event-french">
                                            <p className="event-title">Francés (Grupo/Nivel)</p>
                                            <p className="event-time">6:10 - 7:50 p.m.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="next-session-student">
                    <h2>Próxima Sesión</h2>
                    <div className="next-session-details">
                        <img className="profile-white-student" src={profileWhite} alt="profile" />
                        <h4>Harry Potter</h4>
                    </div>
                    <div className="session-join">
                        <p>Unirse a la reunión</p>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Dashboard