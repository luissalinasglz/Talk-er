import { useEffect, useState } from "react";
import "./tutor-material.css";

function Material() {
    const API_URL = import.meta.env.VITE_API_URL;

    const [materiales, setMateriales] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    
    const [filtro, setFiltro] = useState("Todos");
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevoTipo, setNuevoTipo] = useState("PDF");
    
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
    
    const [nuevoEnlace, setNuevoEnlace] = useState("");
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [subiendo, setSubiendo] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        Promise.all([fetchMateriales(), fetchAlumnos()]).finally(() => {
            setLoading(false);
        });
    }, []);

    async function fetchMateriales() {
        try {
            const res = await fetch(`${API_URL}/tutor/materials`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) setMateriales(data);
        } catch (error) {
            console.error("Error cargando materiales:", error);
        }
    }

    async function fetchAlumnos() {
        try {
            const res = await fetch(`${API_URL}/tutor/my-groups`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) setAlumnos(data);
        } catch (error) {
            console.error("Error cargando alumnos:", error);
        }
    }
    const toggleAlumno = (id) => {
        setAlumnosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const toggleTodos = () => {
        if (alumnosSeleccionados.length === alumnos.length) {
            setAlumnosSeleccionados([]);
        } else {
            setAlumnosSeleccionados(alumnos.map((a) => a.id));
        }
    };

   const materialesAgrupados = Object.values(
        materiales.reduce((acumulador, mat) => {
            const llaveUnica = mat.type === "LINK" ? mat.external_url : mat.file_url;
            const clave = llaveUnica || mat.title;

            if (!acumulador[clave]) {
                acumulador[clave] = { 
                    ...mat, 
                    lista_alumnos: [mat.nombre_alumno] 
                };
            } else {
                if (!acumulador[clave].lista_alumnos.includes(mat.nombre_alumno)) {
                    acumulador[clave].lista_alumnos.push(mat.nombre_alumno);
                }
            }
            
            return acumulador;
        }, {})
    );

    const materialesFiltrados = materialesAgrupados.filter((mat) =>
        filtro === "Todos" ? true : mat.lista_alumnos.includes(filtro)
    );

    const columnaIzquierda = materialesFiltrados.filter((_, i) => i % 2 === 0);
    const columnaDerecha = materialesFiltrados.filter((_, i) => i % 2 !== 0);

async function publicarMaterial() {
        if (!nuevoTitulo.trim()) return setMessage("Ingresa un título.");
        if (alumnosSeleccionados.length === 0) return setMessage("Selecciona al menos un alumno.");
        if (nuevoTipo === "LINK" && !nuevoEnlace.trim()) return setMessage("Ingresa un enlace.");
        if (nuevoTipo !== "LINK" && !archivoSeleccionado) return setMessage("Selecciona un archivo.");

        try {
            setSubiendo(true);
            
            const formData = new FormData();
            formData.append("title", nuevoTitulo);
            
            formData.append("student_tutor_ids", JSON.stringify(alumnosSeleccionados));
            
            formData.append("type", nuevoTipo);
            
            if (nuevoTipo === "LINK") {
                formData.append("external_url", nuevoEnlace);
            } else {
                formData.append("file", archivoSeleccionado);
            }

            const res = await fetch(`${API_URL}/tutor/materials`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Material publicado exitosamente para los alumnos seleccionados.");
                setNuevoTitulo("");
                setNuevoEnlace("");
                setArchivoSeleccionado(null);
                setNuevoTipo("PDF");
                setAlumnosSeleccionados([]);
                fetchMateriales();
            } else {
                setMessage(data.message || "Error al subir.");
            }

        } catch (error) {
            console.error(error);
            setMessage("Error subiendo material.");
        } finally {
            setSubiendo(false);
        }
    }

    function abrirMaterial(mat) {
        const url = mat.type === "LINK" ? mat.external_url : `${API_URL}${mat.file_url}`;
        window.open(url, "_blank");
    }

    const renderizarZonaCarga = () => {
        if (nuevoTipo === "LINK") {
            return (
                <div className="exam-form group-spacing">
                    <input
                        type="url"
                        className="input-field"
                        placeholder="https://..."
                        value={nuevoEnlace}
                        onChange={(e) => setNuevoEnlace(e.target.value)}
                    />
                </div>
            );
        }

        return (
            <label className="upload-zone">
                <p className="upload-icon-text">Haz clic aquí para buscar en tu equipo</p>
                <div className="upload-btn">Seleccionar Archivo</div>
                <input
                    type="file"
                    className="hidden-file-input"
                    onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                />
                {archivoSeleccionado && (
                    <p className="file-name-preview">📎 {archivoSeleccionado.name}</p>
                )}
            </label>
        );
    };

    if (loading) return <p className="loading-text">Cargando materiales...</p>;

    return (
        <div className="material">
            <div className="line-material"></div>

            <div className="material-content">
                <div className="material-left">
                    <div className="type-material">
                        <div
                            className={`type-tab ${filtro === "Todos" ? "active" : ""}`}
                            onClick={() => setFiltro("Todos")}
                        >
                            <p>Todos</p>
                        </div>
                        {alumnos.map((alumno) => (
                            <div
                                key={`tab-${alumno.id}`}
                                className={`type-tab ${filtro === alumno.student_name ? "active" : ""}`}
                                onClick={() => setFiltro(alumno.student_name)}
                            >
                                <p>{alumno.student_name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="material-title">
                        <h2>Material Publicado</h2>
                    </div>

                    <div className="material-info">
                        <div className="material-side">
                            {columnaIzquierda.map((mat) => (
                                <MaterialCard key={mat.id} mat={mat} onOpen={abrirMaterial} />
                            ))}
                        </div>
                        <div className="material-side">
                            {columnaDerecha.map((mat) => (
                                <MaterialCard key={mat.id} mat={mat} onOpen={abrirMaterial} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="material-right">
                    <h2>Subir Nuevo Material</h2>

                    <div className="exam-form group-spacing">
                        <p className="form-label">Título material</p>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ej: Lesson 3"
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                        />
                    </div>

                    <div className="exam-form group-spacing">
                        <p className="form-label">Asignar a:</p>
                        {alumnos.length === 0 ? (
                            <p className="input-field">No tienes alumnos asignados</p>
                        ) : (
                            <div className="alumnos-selection-box">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={alumnosSeleccionados.length === alumnos.length && alumnos.length > 0}
                                        onChange={toggleTodos}
                                    />
                                    <strong>Seleccionar a todos</strong>
                                </label>
                                
                                <div className="select-all-divider"></div>

                                {alumnos.map((alumno) => (
                                    <label key={`check-${alumno.id}`} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={alumnosSeleccionados.includes(alumno.id)}
                                            onChange={() => toggleAlumno(alumno.id)}
                                        />
                                        {alumno.student_name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="exam-form group-spacing">
                        <p className="form-label">Tipo material</p>
                        <select
                            className="input-field"
                            value={nuevoTipo}
                            onChange={(e) => setNuevoTipo(e.target.value)}
                        >
                            <option value="PDF">PDF</option>
                            <option value="DOC">DOC</option>
                            <option value="IMAGE">Imagen</option>
                            <option value="VIDEO">Video</option>
                            <option value="LINK">Enlace</option>
                        </select>
                    </div>

                    {renderizarZonaCarga()}

                    <div
                        className={`material-save-btn ${subiendo || alumnos.length === 0 ? "disabled" : ""}`}
                        onClick={alumnos.length > 0 && !subiendo ? publicarMaterial : undefined}
                    >
                        <p>{subiendo ? "Publicando..." : "Publicar Material"}</p>
                    </div>

                     {message && <p className="success-message">{message}</p>}
                </div>
            </div>
        </div>
    );
}

function MaterialCard({ mat, onOpen }) {
    const nombres = mat.lista_alumnos.join(", ");

    return (
        <div className="material-data">
            <h3>{mat.title}</h3>
            <p>{mat.type} - {nombres}</p>
            <div className="material-button" onClick={() => onOpen(mat)}>
                <p>Ver material</p>
            </div>
        </div>
    );
}

export default Material;