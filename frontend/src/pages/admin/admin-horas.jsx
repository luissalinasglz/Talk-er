import "./admin-horas.css";

function AdminHoras() {
    return(
        <div className="horas-admin">
            <div className="horas-left">
                <h2>Meta de horas por programa</h2>
                <p>Define cuántas horas debe acreditar un tutor en el periodo 
                según el tipo de programa. Esto se refleja en el progreso 
                visible en su dashboard y en los reportes del revisor.</p>
                <div className="hours-period">
                    <div className="period-detail">
                        <h4>Periodo Normal (Inglés)
                        Clases Particulares</h4>
                    </div>
                    <div className="select-hours">
                        <p>Meta:</p>
                        <input type="text" placeholder="180" />
                    </div>
                    <div className="select-hours">
                        <p>Periodo:</p>
                        <input type="text" placeholder="Feb-Jun 2026" />
                    </div>
                </div>
                <div className="hours-period">
                    <div className="period-detail">
                        <h4>Periodo Normal (Frances)
                        Clases Particulares</h4>
                    </div>
                    <div className="select-hours">
                        <p>Meta:</p>
                        <input type="text" placeholder="180" />
                    </div>
                    <div className="select-hours">
                        <p>Periodo:</p>
                        <input type="text" placeholder="Feb-Jun 2026" />
                    </div>
                </div>
                <div className="hours-period">
                    <div className="period-detail">
                        <h4>Periodo Intensivo (Inglés)
                        Clases Particulares</h4>
                    </div>
                    <div className="select-hours">
                        <p>Meta:</p>
                        <input type="text" placeholder="200" />
                    </div>
                    <div className="select-hours">
                        <p>Periodo:</p>
                        <input type="text" placeholder="Jul-Ago 2026" />
                    </div>
                </div>
                <div className="hours-period">
                    <div className="period-detail">
                        <h4>Periodo Intensivo (Frances)
                        Clases Particulares</h4>
                    </div>
                    <div className="select-hours">
                        <p>Meta:</p>
                        <input type="text" placeholder="200" />
                    </div>
                    <div className="select-hours">
                        <p>Periodo:</p>
                        <input type="text" placeholder="Jul-Ago 2026" />
                    </div>
                </div>

                <div className="save-activity-btn">
                    <p>Guardar</p>
                </div>
            </div>

            <div className="horas-right">
                <h2>Valor de cada Actividad</h2>
                <p>Define cuántas horas acredita cada tipo de actividad que 
                realiza el tutor. Estas horas se suman automáticamente a su 
                progreso.</p>

                <div className="activity-header">
                    <span className="col-activity">Actividad</span>
                    <span className="col-hrs">Hrs. Actividad</span>
                    <span className="col-pct">Porcentaje Total</span>
                </div>

                {[
                    { name: "Registro de bitácoras", hrs: 6, pct: "80%" },
                    { name: "Carta", hrs: 18, pct: "10%" },
                    { name: "Video", hrs: 18, pct: "10%" },
                ].map((activity, index) => (
                    <div key={index} className="activity-row">
                        <span className="col-activity">{activity.name}</span>
                        <input
                            type="number"
                            className="activity-input"
                            defaultValue={activity.hrs}
                        />
                        <input
                            type="text"
                            className="activity-input"
                            defaultValue={activity.pct}
                        />
                    </div>
                ))}

                <div className="add-activity-btn">
                    <p>Agregar Actividad</p>
                </div>

                <div className="save-activity-btn">
                    <p>Guardar</p>
                </div>
            </div>
        </div>
    );

}

export default AdminHoras