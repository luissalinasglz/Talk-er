import { useEffect, useState } from "react";
import "./student-material.css";

const API_URL = import.meta.env.VITE_API_URL;

const FILTROS_TIPO = ["Todos", "DOCUMENT", "IMAGE", "VIDEO", "LINK"];

const TIPO_LABEL = {
    DOCUMENT: "Documentos",
    IMAGE: "Imagen",
    VIDEO: "Video",
    LINK: "Enlace",
};

function StudentMaterial() {
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("Todos");
    const [filtroIdioma, setFiltroIdioma] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/student/materials`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => setMateriales(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error cargando materiales:", err))
            .finally(() => setLoading(false));
    }, []);

    // Idiomas únicos disponibles para este alumno
    const idiomasUnicos = [...new Set(materiales.map((m) => m.idioma))];
    const idiomasDisponibles = ["Todos", ...idiomasUnicos];

    const materialesFiltrados = materiales.filter((m) => {
        const coincideTipo =
            filtroTipo === "Todos" ||
            (filtroTipo === "DOCUMENT" && ["PDF", "DOC"].includes(m.type)) ||
            m.type === filtroTipo;
        const coincideIdioma = filtroIdioma === "Todos" || m.idioma === filtroIdioma;
        const coincideBusqueda = m.title.toLowerCase().includes(busqueda.toLowerCase());
        return coincideTipo && coincideIdioma && coincideBusqueda;
    });

    function abrirMaterial(m) {
        const url = m.type === "LINK" ? m.external_url : m.signed_file_url;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    }

    if (loading) return <p>Cargando materiales...</p>;

    return (
        <div className="material-student">

            {/* FILTROS */}
            <div className="type-material-admin">
                <div className="options-material">
                    {FILTROS_TIPO.map((f) => (
                        <div
                            key={f}
                            className={`opti-material ${filtroTipo === f ? "active-material" : ""}`}
                            onClick={() => setFiltroTipo(f)}
                        >
                            <p>{f === "Todos" ? "Todos" : TIPO_LABEL[f]}</p>
                        </div>
                    ))}
                    {idiomasUnicos.length > 1 &&
                        idiomasDisponibles.map((idioma) => (
                            <div
                                key={idioma}
                                className={`opti-material ${filtroIdioma === idioma ? "active-material" : ""
                                    }`}
                                onClick={() => setFiltroIdioma(idioma)}
                            >
                                <p>{idioma}</p>
                            </div>
                        ))
                    }
                </div>
                <div className="search-material">
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="search-material-input"
                    />
                </div>
            </div>

            {/* GRID */}
            {materialesFiltrados.length === 0 ? (
                <div className="material-empty">
                    <p>No hay materiales disponibles.</p>
                </div>
            ) : (
                <div className="mat-admin">
                    {materialesFiltrados.map((m) => (
                        <div key={m.id} className="material-data-admin">
                            <div className="material-tipo-icon">
                                <span className="material-tipo-badge">{TIPO_LABEL[m.type] || m.type}</span>
                            </div>
                            <h3>{m.title}</h3>
                            <p className="material-idioma">{m.idioma}</p>
                            <p className="material-fecha">
                                {new Date(m.uploaded_at).toLocaleDateString("es-MX", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            <div
                                className="material-button-admin"
                                onClick={() => abrirMaterial(m)}
                            >
                                <p>Ver material</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentMaterial;