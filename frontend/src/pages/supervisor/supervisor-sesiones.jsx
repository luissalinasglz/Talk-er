import "./supervisor-sesiones.css";

function SupervisorSesiones() {
    return(
        <div className="sesiones-supervisor">
            <div className="sessions-line"></div>

            <div className="sessions">
                
                <div className="sessions-left">
                    <h2>Tutores</h2>
                    <div className="tutor-info select">
                        <h4>Harry Potter</h4>
                        <p>Inglés B - 9 de marzo</p>
                    </div>
                    <div className="tutor-info">
                        <h4>Ron Weasley</h4>
                        <p>Inglés A - 6 de marzo</p>
                    </div>
                    <div className="tutor-info">
                        <h4>Hermione Granger</h4>
                        <p>Frances A - 5 de marzo</p>
                    </div>
                </div>

                <div className="sessions-right">
                    <div className="tutor-generalinfo">
                        <div className="data-info">
                            <h2>Harry Potter</h2>
                            <p>Inglés B</p>
                            <p>Período Febrero - Junio</p>
                        </div>
                        <div className="numeric-data">
                            <h3>12</h3>
                            <p>Sesiones</p>
                        </div>
                        <div className="numeric-data">
                            <h3>12</h3>
                            <p>Bitácoras</p>
                        </div>
                        <div className="numeric-data">
                            <h3>1</h3>
                            <p>Incidencias</p>
                        </div>
                    </div>

                    <div className="validated-info">
                        <h3>Marzo 2026</h3>
                        <div className="sessionday">
                            <div className="date">
                                <p>Lunes</p>
                                <h4>9 de Marzo</h4>
                            </div>
                            <div className="sessionday-info">
                                <h4>Inglés B</h4>
                                <h4>Sesión 12</h4>
                                <p>3:10 p.m. - 4:50 p.m.</p>
                                <p>Lección del Verbo To Be</p>
                            </div>
                            <div className="pen">
                                <p>Asistencia Pendiente</p>
                            </div>
                            <div className="pen">
                                <p>Bitácora Pendiente</p>
                            </div>
                        </div>

                        <div className="sessionday">
                            <div className="date">
                                <p>Jueves</p>
                                <h4>5 de Marzo</h4>
                            </div>
                            <div className="sessionday-info">
                                <h4>Inglés B</h4>
                                <h4>Sesión 11</h4>
                                <p>3:10 p.m. - 4:50 p.m.</p>
                                <p>Lección Pasado Simple</p>
                            </div>
                            <div className="val">
                                <p>Asistencia Validada</p>
                            </div>
                            <div className="val">
                                <p>Bitácora Validada</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
        </div>
    );

}

export default SupervisorSesiones