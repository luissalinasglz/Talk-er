import { useState } from "react";
import "./tutor-bitacoras.css";

function Bitacoras() {
    const [incidencia, setIncidencia] = useState(null);

    return (
        <div className="bitacoras">
            <div className="bitacora-line"></div>

            <div className="bitacoras-content">

                <div className="bitacoras-left">
                    <h3>Mis Bitácoras</h3>
                    <p className="month">Marzo 2026</p>
                    <div className="bitacora-item active">
                        <p className="item-name">Sesión Lunes 9 de marzo</p>
                        <p className="item-hour">Hoy 3:10 p.m. - 4:50 p.m.</p>
                        <p className="item-class">Inglés A</p>
                    </div>
                    <div className="bitacora-item">
                        <p className="item-name">Sesión Jueves 5 de marzo</p>
                        <p className="item-hour">Hoy 5:10 p.m. - 6:50 p.m.</p>
                        <p className="item-class">Inglés B</p>
                    </div>
                    <p className="month">Febrero 2026</p>
                    <div className="bitacora-item">
                        <p className="item-name">Sesión Lunes 23 de febrero</p>
                        <p className="item-hour">Hoy 3:10 p.m. - 4:00 p.m.</p>
                        <p className="item-class">Inglés A</p>
                    </div>
                </div>

                <div className="bitacoras-right">
                    <h2>Bitácora - Inglés A - Lunes 9 de Marzo</h2>
                    <p className="bitacora-hour">3:10 p.m. - 4:50 p.m.</p>

                    <div className="bitacoras-side">
                        <div className="bitacora-right-left">
                            <div className="bitacora-row">
                                <div className="bitacora-group">
                                    <p>Clase</p>
                                    <div className="bitacora-input">
                                        <p>Inglés (Nivel)</p>
                                    </div>
                                </div>
                                <div className="bitacora-group">
                                    <p>Fecha de Sesión</p>
                                    <div className="bitacora-input">
                                        <p>dd/mm/aaaa</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Tema visto</p>
                                <div className="bitacora-input">
                                    <p>Ej: Unidad 3</p>
                                </div>
                            </div>

                            <div className="bitacora-group grow">
                                <p>Descripción de la sesión</p>
                                <div className="bitacora-text">
                                    <p>Ej: Se vio la Unidad 3</p>
                                </div>
                            </div>

                            <div className="bitacora-group grow">
                                <p>Planeación de la siguiente sesión</p>
                                <div className="bitacora-text">
                                    <p>Ej: Habrá examen de Unidad 3</p>
                                </div>
                            </div>
                        </div>

                        <div className="bitacora-right-right">
                            <div className="bitacora-group">
                                <p>Horario de Sesión</p>
                                <div className="bitacora-input">
                                    <p>--:--</p>
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Duración de la sesión(min)</p>
                                <div className="bitacora-input">
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Tareas asignadas</p>
                                <div className="bitacora-input">
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Subir evidencia</p>
                                <div className="bitacora-upload">
                                    <p>Haz Click para adjuntar un archivo</p>
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Hubo <strong>incidencias</strong> en la clase</p>
                                <div className="incidencia-selector">
                                    <div
                                        className={`incidencia-btn ${incidencia === true ? "active" : ""}`}
                                        onClick={() => setIncidencia(true)}>
                                        Sí
                                    </div>
                                    <div
                                        className={`incidencia-btn ${incidencia === false ? "active-no" : ""}`}
                                        onClick={() => setIncidencia(false)}>
                                        No
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {incidencia === true && (
                        <div className="incidencia-extra">
                            <div className="bitacora-group">
                                <p>Resumen</p>
                                <div className="bitacora-text">
                                    <p>Ej: Llegada tarde 3</p>
                                </div>
                            </div>
                            <div className="bitacora-group">
                                <p>Descripción de la incidencia</p>
                                <div className="bitacora-text">
                                    <p>Ej: El alumno se presento 30min tarde 3</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="save">
                        <div className="button">Guardar Bitácora</div>
                    </div>       
                </div>
            </div>
        </div>
    );
}

export default Bitacoras;