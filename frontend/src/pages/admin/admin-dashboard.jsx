import "./admin-dashboard.css";

function Dashboard() {
    const tutores = [
        {nombre: "Otrebor Castro", clase: "Inglés (Nivel)", horas: 42, total: 60, porcentaje: 70 },
        {nombre: "Wicho Toño", clase: "Frances (Nivel)", horas: 42, total: 80, porcentaje: 70 },
    ];

    const metricas = [
        { nombre: "Calificación Promedio", valor: 78, porcentaje: 78 },
        { nombre: "Asistencia Promedio", valor: "84%", porcentaje: 84 },
        { nombre: "Tasa de Entrega de Tareas", valor: "91%", porcentaje: 91 },
        { nombre: "Horas de Tutores Acreditadas", valor: "67%", porcentaje: 67 },
    ];

    return(
        <div className="dashboard-admin">
            <div className="admin-content">
                <div className="admin-widgets">
                    <div className="admin-wid">
                        <p>Tutores</p>
                        <h3>10</h3>
                        <p>Con alumnos activos</p>
                    </div>
                    <div className="admin-wid">
                        <p>Alumnos</p>
                        <h3>20</h3>
                        <p>En el programa</p>
                    </div>
                    <div className="admin-wid">
                        <p>Promedio Global</p>
                        <h3>78</h3>
                        <p>Semestre en curso</p>
                    </div>
                    <div className="admin-wid">
                        <p>Dias restantes</p>
                        <h3>82</h3>
                        <p>Semestre Actual</p>
                    </div>
                </div>
                <div className="side-admin">
                    <div className="left-admin">
                        <div className="program">
                            <p>Programa Activo</p>
                            <h2>Ciclo</h2>
                            <h2>Febrero -  Junio</h2>
                            <p>9 de febrero - 19 de junio 2026</p>
                        </div>

                        <div className="hours-count">
                            <h3>Avance de horas por tutor</h3>
                            {tutores.map((tutor, i) => (
                                <div key={i} className="tutor-progress">
                                    <div className="circle-progress"></div>
                                    <div className="tutor-progress-info">
                                        <p className="tutor-progress-nombre">{tutor.nombre}</p>
                                        <p className="tutor-progress-clase">{tutor.clase}</p>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${tutor.porcentaje}%` }}></div>
                                        <p className="progress-label">{tutor.horas}/{tutor.total} horas</p>
                                    </div>
                                    <p className="progress-percent">{tutor.porcentaje}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="right-admin">
                        <h3>Métricas del Programa Actual</h3>
                        {metricas.map((metrica, i) => (
                            <div key={i} className="metrica-row">
                                <p className="metrica-nombre">{metrica.nombre}</p>
                                <div className="metrica-bar-container">
                                    <div className="metrica-bar-fill" style={{ width: `${metrica.porcentaje}%` }}></div>
                                </div>
                                <p className="metrica-valor">{metrica.valor}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Dashboard