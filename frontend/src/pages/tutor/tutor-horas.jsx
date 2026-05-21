import "./tutor-horas.css";

function Horas() {
    return (
        <div className="horas">
            <div className="horas-side">
                <div className="horas-left">
                    <div className="info-hours">
                        <div className="circle-hours">
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <circle
                                    cx="40" cy="40" r="34"
                                    fill="#252467"
                                    stroke="#555588"
                                    strokeWidth="5"
                                />
                                <circle
                                    cx="40" cy="40" r="34"
                                    fill="none"
                                    stroke="#93E490"
                                    strokeWidth="5"
                                    strokeDasharray={`${2 * Math.PI * 34 * 0.20} ${2 * Math.PI * 34}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 40 40)"
                                />
                                <text x="40" y="46" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">36</text>
                            </svg>
                        </div>
                        <div className="total-hours">
                            <h3>36 de 180 horas acreditadas</h3>
                            <p>Periodo Febrero-Junio 2026</p>
                        </div>
                    </div>
                    <div className="count-hours">
                        <h2>Desglose por categoria</h2>
                        <div className="count-data">
                            <p>Bitácoras registradas</p>
                            <div className="percentage-hours">
                                <div className="line-percentage"></div>
                            </div>
                            <p>36hrs</p>
                        </div>
                        <div className="count-data">
                            <p>Carta</p>
                            <div className="percentage-hours"></div>
                            <p>0hrs</p>
                        </div>
                        <div className="count-data">
                            <p>Video</p>
                            <div className="percentage-hours"></div>
                            <p>0hrs</p>
                        </div>
                    </div>
                </div>

                <div className="horas-right">
                    <div className="advance">
                        <p>Horas completadas este mes</p>
                        <p>Marzo 2026</p>
                        <h1>12hrs</h1>
                    </div>
                    <div className="advance sessions-days">
                        <p>Sesiones impartidas</p>
                        <p>Marzo 2026</p>
                        <h1>6</h1>
                    </div>
                </div>
            </div>
            

            <div className="hours-record">
                <p className="category-title">Historial de horas</p>
                <div className="category-total">
                    <div className="category-data">
                        <p>Fecha</p>
                        <p>9 de marzo</p>
                        <p>5 de marzo</p>
                        <p>2 de marzo</p>
                        <p>26 de febrero</p>
                    </div>
                    <div className="category-data">
                        <p>Actividad</p>
                        <p>Registro de bitácora</p>
                        <p>Registro de bitácora</p>
                        <p>Registro de bitácora</p>
                        <p>Registro de bitácora</p>
                    </div>
                    <div className="category-data">
                        <p>Clase</p>
                        <p>Inglés A</p>
                        <p>Inglés A</p>
                        <p>Inglés A</p>
                        <p>Inglés A</p>
                    </div>
                    <div className="category-data">
                        <p>Horas</p>
                        <p>6 hrs</p>
                        <p>6 hrs</p>
                        <p>6 hrs</p>
                        <p>6 hrs</p>
                    </div>
                    <div className="category-data">
                        <p>Estado</p>
                        <p>Pendiente</p>
                        <p>Aceptada</p>
                        <p>Aceptada</p>
                        <p>Aceptada</p>
                    </div>
                </div>
                
            </div>


        </div>
    );
}

export default Horas