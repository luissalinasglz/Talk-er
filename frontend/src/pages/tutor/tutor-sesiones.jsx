import "./tutor-sesiones.css";

function Sesiones() {
    return (
        <div className="sessions">
            <div className="sessions-list">
                <div className="list-title">
                    <p>Clases</p>
                </div>
                <div className="list-classes">
                    <div className="class-item active">
                        <p>Inglés A</p>
                    </div>
                    <div className="class-item">
                        <p>Inglés B</p>
                    </div>
                </div>
            </div>

        <div className="sessions-content">
            <div className="blue-rectangle">
                <h2>Luis Antonio Salinas</h2>
                <p>Inglés A</p>
            </div>

            <div className="info-rectangle">
                <h3>Horario de clases</h3>
                <div className="line"></div>
                <div className="select-day">
                    <p>Día de la semana</p>
                    <div className="weekdays">
                        <p className="day active">Lunes</p>
                        <p className="day">Martes</p>
                        <p className="day">Mircoles</p>
                        <p className="day active">Jueves</p>
                        <p className="day">Viernes</p>
                    </div>
                </div>
                <div className="select-hour">
                    <div className="start-time">
                        <p>Hora de incio</p>
                        <div className="time">
                            <p>3:10 p.m.</p>
                        </div>
                    </div>
                    <div className="end-time">
                        <p>Hora de fin</p>
                        <div className="time">
                            <p>4:50 p.m.</p>
                        </div>
                    </div>
                </div>
                <div className="save">
                    <div className="button">
                        <p>Guardar Horario</p>
                    </div>
                </div>
            </div>
        </div>

        </div>
    );
}

export default Sesiones;