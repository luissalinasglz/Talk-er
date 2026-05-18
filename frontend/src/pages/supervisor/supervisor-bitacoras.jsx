import "./supervisor-bitacoras.css";
import { useState } from "react";

function SupervisorBitacoras() {
    const [incidencia, setIncidencia] = useState(false);

    return(
        <div className="bitacoras-supervisor">
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

                        </div>

                        <div className="bitacora-right-right">

                            <div className="bitacora-group">
                                <p>Duración de la sesión(min)</p>
                                <div className="bitacora-input">
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Evidencia de la clase</p>
                                <div className="bitacora-upload">
                                    <p>Seleccionar archivo</p>
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

                <div className="bitacoras-review">
                    <h4>Revisión del revisor</h4>
                    
                    <h3 className="review-subtitle">Campos a corregir</h3>
                    <div className="review-fields">
                        <div className="review-field">Tema visto en clase</div>
                        <div className="review-field active">Descripción de la sesión</div>
                        <div className="review-field">Descripción de incidencia</div>
                    </div>

                    <h3 className="review-subtitle">Comentarios</h3>
                    <div className="review-comments"></div>

                    <div className="review-buttons">
                        <div className="btn-correction">Solicitar Corrección</div>
                        <div className="btn-approve">Aprobar Bitácora</div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default SupervisorBitacoras