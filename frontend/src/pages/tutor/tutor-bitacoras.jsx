import { useState } from "react";
import "./tutor-bitacoras.css";

function Bitacoras() {
    const [incidencia, setIncidencia] = useState(null);

    const sesiones = [
        { 
            id: 1, 
            nombre: "Sesión Lunes 9 de marzo", 
            fecha: "2026-03-09", 
            hora: "15:10", 
            duracion: 60, 
            clase: "Inglés A",
            rangoTexto: "3:10 p.m. - 4:10 p.m."
        },
        { 
            id: 2, 
            nombre: "Sesión Jueves 5 de marzo", 
            fecha: "2026-03-05", 
            hora: "17:10", 
            duracion: 100, 
            clase: "Inglés B",
            rangoTexto: "5:10 p.m. - 6:50 p.m."
        },
        { 
            id: 3, 
            nombre: "Sesión Lunes 23 de febrero", 
            fecha: "2026-02-23", 
            hora: "15:10", 
            duracion: 50, 
            clase: "Inglés A",
            rangoTexto: "3:10 p.m. - 4:00 p.m."
        }
    ];

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const mesesDisponibles = [...new Set(
        sesiones.map(s => s.fecha.slice(0, 7))
    )];

    const obtenerMesBonito = (valor) => {
        const [year, month] = valor.split("-");
        return `${meses[parseInt(month, 10) - 1]} ${year}`;
    };

    const [mesActivo, setMesActivo] = useState(mesesDisponibles[0]);
    const [sesionActivaId, setSesionActivaId] = useState(sesiones[0].id);

    const sesionesFiltradas = sesiones.filter(s =>
        s.fecha.startsWith(mesActivo)
    );

    const datosSesion =
        sesiones.find(s => s.id === sesionActivaId) || sesionesFiltradas[0];

    return (
        <div className="bitacoras">
            <div className="bitacora-line"></div>

            <div className="bitacoras-content">

                {/* IZQUIERDA */}
                <div className="bitacoras-left">
                    <h3>Mis Bitácoras</h3>

                    <select
                        className="month-select"
                        value={mesActivo}
                        onChange={(e) => {
                            const nuevoMes = e.target.value;
                            setMesActivo(nuevoMes);

                            const primeraSesion = sesiones.find(s =>
                                s.fecha.startsWith(nuevoMes)
                            );

                            if (primeraSesion) {
                                setSesionActivaId(primeraSesion.id);
                            }
                        }}
                    >
                        {mesesDisponibles.map((mes) => (
                            <option key={mes} value={mes}>
                                {obtenerMesBonito(mes)}
                            </option>
                        ))}
                    </select>

                    {sesionesFiltradas.map((s) => (
                        <div
                            key={s.id}
                            className={`bitacora-item ${
                                sesionActivaId === s.id ? "active" : ""
                            }`}
                            onClick={() => setSesionActivaId(s.id)}
                        >
                            <p className="item-name">{s.nombre}</p>
                            <p className="item-hour">{s.rangoTexto}</p>
                            <p className="item-class">{s.clase}</p>
                        </div>
                    ))}
                </div>

                {/* DERECHA */}
                <div className="bitacoras-right">
                    <h2>
                        Bitácora - {datosSesion.clase} -{" "}
                        {datosSesion.nombre.replace("Sesión ", "")}
                    </h2>

                    <p className="bitacora-hour">
                        {datosSesion.rangoTexto}
                    </p>

                    <div className="bitacoras-side">

                        <div className="bitacora-right-left">
                            <div className="bitacora-row">
                                <div className="bitacora-group">
                                    <p>Clase</p>
                                    <input
                                        className="bitacora-input-real"
                                        type="text"
                                        value={datosSesion.clase}
                                        readOnly
                                    />
                                </div>

                                <div className="bitacora-group">
                                    <p>Fecha de Sesión</p>
                                    <input
                                        className="bitacora-input-real"
                                        type="date"
                                        value={datosSesion.fecha}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="bitacora-group">
                                <p>Tema visto</p>
                                <input
                                    className="bitacora-input-real"
                                    type="text"
                                    placeholder="Ej: Unidad 3"
                                />
                            </div>

                            <div className="bitacora-group grow">
                                <p>Descripción de la sesión</p>
                                <textarea
                                    className="bitacora-text-real"
                                    placeholder="Ej: Se vio la Unidad 3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="bitacora-right-right">
                            <div className="bitacora-group">
                                <p>Horario de Sesión</p>
                                <input
                                    className="bitacora-input-real"
                                    type="time"
                                    value={datosSesion.hora}
                                    readOnly
                                />
                            </div>

                            <div className="bitacora-group">
                                <p>Duración de la sesión (min)</p>
                                <input
                                    className="bitacora-input-real"
                                    type="number"
                                    value={datosSesion.duracion}
                                    readOnly
                                />
                            </div>

                            <div className="bitacora-group">
                                <p>Tareas asignadas</p>
                                <input
                                    className="bitacora-input-real"
                                    type="text"
                                    placeholder="Ej: Página 45"
                                />
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
                                        className={`incidencia-btn ${
                                            incidencia === true ? "active" : ""
                                        }`}
                                        onClick={() => setIncidencia(true)}
                                    >
                                        Sí
                                    </div>

                                    <div
                                        className={`incidencia-btn ${
                                            incidencia === false ? "active-no" : ""
                                        }`}
                                        onClick={() => setIncidencia(false)}
                                    >
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
                                <input
                                    className="bitacora-input-real"
                                    type="text"
                                    placeholder="Ej: Llegada tarde"
                                />
                            </div>

                            <div className="bitacora-group">
                                <p>Descripción de la incidencia</p>
                                <textarea
                                    className="bitacora-text-real"
                                    placeholder="Detalles..."
                                ></textarea>
                            </div>
                        </div>
                    )}

                    <div className="save">
                        <button
                            className="button"
                            onClick={() =>
                                alert("Cambios guardados para " + datosSesion.nombre)
                            }
                        >
                            Guardar Bitácora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Bitacoras;