import { useEffect, useRef, useState } from "react";
import "./tutor-material.css";
import imageCompression from "browser-image-compression";

function normalizarUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
}

async function checkUrlStatus(url) {
    try {
        await fetch(url, { method: "HEAD", mode: "no-cors" });
        return true;
    } catch {
        return false;
    }
}

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

    const fileInputRef = useRef(null);

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
                    ids: [mat.id],
                    lista_alumnos: [mat.nombre_alumno],
                };
            } else {
                acumulador[clave].ids.push(mat.id);
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
        if (nuevoTipo !== "LINK" && !archivoSeleccionado) return setMessage("Selecciona un archivo.");

        let enlaceFinal = null;

        if (nuevoTipo === "LINK") {
            if (!nuevoEnlace.trim()) return setMessage("Ingresa un enlace.");

            enlaceFinal = normalizarUrl(nuevoEnlace);
            setNuevoEnlace(enlaceFinal);

            setMessage("Verificando enlace...");
            const valido = await checkUrlStatus(enlaceFinal);

            if (!valido) return setMessage("El enlace no es accesible. Verifica que sea correcto.");
        }

        try {
            setSubiendo(true);
            setMessage("");

            let fileKey = null;

            if (nuevoTipo !== "LINK") {
                let archivoFinal = archivoSeleccionado;

                if (archivoSeleccionado.type.startsWith("image/")) {
                    archivoFinal = await imageCompression(archivoSeleccionado, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                    });
                }

                const presignRes = await fetch(`${API_URL}/tutor/storage/presign`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "material",
                        filename: archivoFinal.name,
                        contentType: archivoFinal.type,
                    }),
                });

                const presignData = await presignRes.json();

                if (!presignRes.ok) {
                    throw new Error(presignData.message || "Error preparando archivo");
                }

                const uploadRes = await fetch(presignData.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": archivoFinal.type },
                    body: archivoFinal,
                });

                if (!uploadRes.ok) throw new Error("Error subiendo archivo");

                fileKey = presignData.fileKey;
            }

            const res = await fetch(`${API_URL}/tutor/materials`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: nuevoTitulo.trim(),
                    student_tutor_ids: alumnosSeleccionados,
                    type: nuevoTipo,
                    file_url: fileKey,
                    external_url: nuevoTipo === "LINK" ? enlaceFinal : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Error publicando material");

            setMessage("Material publicado exitosamente.");
            setNuevoTitulo("");
            setNuevoEnlace("");
            setArchivoSeleccionado(null);
            setNuevoTipo("PDF");
            setAlumnosSeleccionados([]);

            if (fileInputRef.current) fileInputRef.current.value = "";

            fetchMateriales();
        } catch (error) {
            console.error(error);
            setMessage(error.message || "Error subiendo material.");
        } finally {
            setSubiendo(false);
        }
    }

    async function eliminarMaterial(mat) {
        const confirmar = window.confirm(
            `¿Eliminar "${mat.title}"? Esto lo quitará para todos los alumnos asignados.`
        );

        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/tutor/deleteMaterial`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_tutor_ids: mat.ids,
                    file_url: mat.file_url,
                    type: mat.type,
                }),
            });

            const data = await res.json();

            if (!res.ok) return setMessage(data.message || "Error eliminando material.");

            setMessage("Material eliminado correctamente.");
            fetchMateriales();
        } catch (error) {
            console.error(error);
            setMessage("Error eliminando material.");
        }
    }

    function abrirMaterial(mat) {
        const url = mat.type === "LINK" ? mat.external_url : mat.signed_file_url;
        if (!url) return setMessage("No se encontró el archivo.");
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
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                    className="hidden-file-input"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setMessage("");
                        if (file.size > 5 * 1024 * 1024) {
                            setMessage("El archivo supera 5MB.");
                            return;
                        }
                        setArchivoSeleccionado(file);
                    }}
                />
                {archivoSeleccionado && (
                    <p className="file-name-preview">📎 {archivoSeleccionado.name}</p>
                )}
            </label>
        );
    };

    if (loading) {
        return <p className="loading-text">Cargando materiales...</p>;
    }

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
                                <MaterialCard
                                    key={mat.id}
                                    mat={mat}
                                    onOpen={abrirMaterial}
                                    onDelete={eliminarMaterial}
                                />
                            ))}
                        </div>
                        <div className="material-side">
                            {columnaDerecha.map((mat) => (
                                <MaterialCard
                                    key={mat.id}
                                    mat={mat}
                                    onOpen={abrirMaterial}
                                    onDelete={eliminarMaterial}
                                />
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
                                        checked={
                                            alumnosSeleccionados.length === alumnos.length &&
                                            alumnos.length > 0
                                        }
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

function MaterialCard({ mat, onOpen, onDelete }) {
    const nombres = mat.lista_alumnos.join(", ");
    return (
        <div className="material-data">
            <h3>{mat.title}</h3>
            <p>{mat.type} - {nombres}</p>
            <div className="material-card-actions">
                <div className="material-button" onClick={() => onOpen(mat)}>
                    <p>Ver material</p>
                </div>
                <div className="material-button material-button--delete" onClick={() => onDelete(mat)}>
                    <p>Eliminar</p>
                </div>
            </div>
        </div>
    );
}

export default Material;