import "./admin-estadistica.css";

function AdminEstadisticas() {
    const programas = [
        { ciclo: "Ago - Dic 2025", alumnos: 24, tutores: 18, calificacion: 68, calPct: 68, entregas: 85, entPct: 85, horas: 68, horPct: 68, tendencia: "Base", tendenciaColor: "base" },
        { ciclo: "Feb - Jun 2026", alumnos: 20, tutores: 10, calificacion: 78, calPct: 78, entregas: 91, entPct: 91, horas: 53, horPct: 53, tendencia: "+0.4", tendenciaColor: "positivo" },
    ];

    const horas = [
        { ciclo: "Ago - Dic 2025", alumnos: 24, tutores: 18, horasActual: 130, horasMeta: 180, progreso: 72, estado: "En marcha" },
        { ciclo: "Feb - Jun 2026", alumnos: 20, tutores: 10, horasActual: 122, horasMeta: 180, progreso: 68, estado: "En marcha" },
    ];

    return(
        <div className="estadisticas-admin">
            <div className="estadistic-line"></div>
                
            <div className="estadistic">
                <div className="estadistic-left">
                    <h3>Programas (Ciclos Escolares)</h3>
                    <div className="programs-estadistic">
                        <div className="date-estadistic active-estadistic">
                            <h4>Feb-Jun 2026</h4>
                            <p>9 de febrero - 12 de junio</p>
                        </div>
                        <div className="date-estadistic">
                            <h4>Ago-Dic 2025</h4>
                            <p>7 de agosto - 6 de diciembre</p>
                        </div>
                    </div>
                </div>

                <div className="estadistic-right">
                    <div className="general-estadistic">
                        <div className="program-info">
                            <p>Programa Seleccionado</p>
                            <h2>Ciclo Febrero - Junio 2026</h2>
                            <p>9 de Febrero - 12 de Junio 2026</p>
                            <p>20 alumnos - 10 tutores</p>
                        </div>
                        <div className="general-estadistic-info">
                            <div className="estadistic-info">
                                <h2>78</h2>
                                <p>Calificación</p>
                            </div>
                            <div className="estadistic-info">
                                <h2>84%</h2>
                                <p>Asistencias</p>
                            </div>
                            <div className="estadistic-info">
                                <h2>91%</h2>
                                <p>Entregas</p>
                            </div>
                            <div className="estadistic-info">
                                <h2>53%</h2>
                                <p>Hrs. Tutores</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-table-card">
                        <h2>Evolución de métricas por programa (ciclo escolar)</h2>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Programa (Ciclo escolar)</th>
                                    <th>Calificación Prom.</th>
                                    <th>Tasa de Entrega</th>
                                    <th>Horas Tutores</th>
                                    <th>Tendencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {programas.map((p, i) => (
                                    <tr key={i}>
                                        <td>
                                            <p className="ciclo-nombre">{p.ciclo}</p>
                                            <p className="ciclo-detalle">{p.alumnos} alumnos - {p.tutores} tutores</p>
                                        </td>
                                        <td>
                                            <p className="stat-num">{p.calificacion}</p>
                                            <div className="mini-bar-container">
                                                <div className="mini-bar-fill dark" style={{ width: `${p.calPct}%` }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="stat-num">{p.entregas}%</p>
                                            <div className="mini-bar-container">
                                                <div className="mini-bar-fill dark" style={{ width: `${p.entPct}%` }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="stat-num">{p.horas}%</p>
                                            <div className="mini-bar-container">
                                                <div className="mini-bar-fill dark" style={{ width: `${p.horPct}%` }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`tendencia-badge ${p.tendenciaColor}`}>
                                                {p.tendencia}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="stats-table-card">
                        <h2>Avance de horas acreditadas por tutor</h2>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Tutor</th>
                                    <th>Horas/Meta</th>
                                    <th>Progreso</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horas.map((h, i) => (
                                    <tr key={i}>
                                        <td>
                                            <p className="ciclo-nombre">{h.ciclo}</p>
                                            <p className="ciclo-detalle">{h.alumnos} alumnos - {h.tutores} tutores</p>
                                        </td>
                                        <td>
                                            <p className="stat-num">{h.horasActual}/{h.horasMeta}</p>
                                        </td>
                                        <td>
                                            <div className="progress-row">
                                                <div className="mini-bar-container">
                                                    <div className="mini-bar-fill dark" style={{ width: `${h.progreso}%` }}></div>
                                                </div>
                                                <p className="progress-pct">{h.progreso}%</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="estado-badge">{h.estado}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            
            </div>
        </div>
    );

}

export default AdminEstadisticas