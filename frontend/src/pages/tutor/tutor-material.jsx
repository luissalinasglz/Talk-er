import { useState } from "react";
import "./tutor-material.css";

function Material() {
    // 1. Estado para simular la base de datos de materiales
    const [materiales, setMateriales] = useState([
        { id: 1, titulo: "Guía del verbo to be", tipo: "PDF", clase: "Inglés A" },
        { id: 2, titulo: "Audio Pronunciación", tipo: "Video", clase: "Inglés B" },
        { id: 3, titulo: "Video de Conjugación", tipo: "Video", clase: "Inglés A" },
        { id: 4, titulo: "Video números y colores", tipo: "Enlace externo", clase: "Inglés B" }
    ]);

    // 2. Estados para controlar el formulario y los filtros
    const [filtro, setFiltro] = useState("Todos");
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevoTipo, setNuevoTipo] = useState("PDF/Doc");
    const [nuevaClase, setNuevaClase] = useState("Inglés A");
    const [nuevoEnlace, setNuevoEnlace] = useState(""); // Estado para guardar la URL
    const [metodoVideo, setMetodoVideo] = useState("archivo"); // 'archivo' o 'enlace'

    // Lógica para filtrar la lista
    const materialesFiltrados = materiales.filter(mat => 
        filtro === "Todos" ? true : mat.clase === filtro
    );

    // Dividimos los materiales en dos columnas
    const columnaIzquierda = materialesFiltrados.filter((_, i) => i % 2 === 0);
    const columnaDerecha = materialesFiltrados.filter((_, i) => i % 2 !== 0);

    // Función para simular que publicamos un material
    const publicarMaterial = () => {
        if (!nuevoTitulo) return alert("Por favor ingresa un título para el material.");
        if (nuevoTipo === "Enlace externo" && !nuevoEnlace) return alert("Por favor ingresa el enlace.");
        if (nuevoTipo === "Video" && metodoVideo === "enlace" && !nuevoEnlace) return alert("Por favor ingresa el enlace del video.");
        
        const nuevo = {
            id: Date.now(),
            titulo: nuevoTitulo,
            tipo: nuevoTipo,
            clase: nuevaClase
        };

        setMateriales([nuevo, ...materiales]); 
        setNuevoTitulo(""); 
        setNuevoEnlace("");
        alert("¡Material publicado con éxito! (Modo Demo)");
    };

    // Función para el botón "Ver material"
    const abrirMaterial = (mat) => {
        alert(`Abriendo vista previa de: ${mat.titulo}\n(Simulación para Demo)`);
        if (mat.tipo === "Video") {
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        } else {
            window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
        }
    };

    // Lógica para renderizar la zona de carga dependiendo del tipo
    const renderizarZonaCarga = () => {
        if (nuevoTipo === "Enlace externo") {
            return (
                <div className="exam-form" style={{ marginTop: '1rem' }}>
                    <input 
                        type="url" 
                        placeholder="Pega aquí el enlace (Ej: https://...)" 
                        value={nuevoEnlace}
                        onChange={(e) => setNuevoEnlace(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ccc' }}
                    />
                </div>
            );
        }

        if (nuevoTipo === "Video") {
            return (
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                                type="radio" 
                                checked={metodoVideo === 'archivo'} 
                                onChange={() => setMetodoVideo('archivo')} 
                            />
                            Subir Archivo MP4
                        </label>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                                type="radio" 
                                checked={metodoVideo === 'enlace'} 
                                onChange={() => setMetodoVideo('enlace')} 
                            />
                            Enlace (YouTube/Vimeo)
                        </label>
                    </div>

                    {metodoVideo === 'archivo' ? (
                        <div className="document" style={{ cursor: 'pointer', marginTop: 0 }}>
                            <p>Haz Click para adjuntar o arrastra tu archivo de Video aquí</p>
                        </div>
                    ) : (
                        <input 
                            type="url" 
                            placeholder="Pega aquí el enlace del video (Ej: https://youtube.com/...)" 
                            value={nuevoEnlace}
                            onChange={(e) => setNuevoEnlace(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ccc' }}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="document" style={{ cursor: 'pointer', marginTop: '1rem' }}>
                <p>Haz Click para adjuntar un archivo o arrastra un archivo aquí (PDF, Word, Imagen)</p>
            </div>
        );
    };

    return (
        <div className="material">
            <div className="line-material"></div>
            <div className="material-content">
                
                {/* PANEL IZQUIERDO */}
                <div className="material-left">
                    <div className="type-material">
                        <div 
                            className={`type ${filtro === "Todos" ? "all" : ""}`} 
                            onClick={() => setFiltro("Todos")} 
                            style={{ cursor: 'pointer' }}
                        >
                            <p>Todos</p>
                        </div>
                        <div 
                            className={`type ${filtro === "Inglés A" ? "all" : ""}`} 
                            onClick={() => setFiltro("Inglés A")} 
                            style={{ cursor: 'pointer' }}
                        >
                            <p>Inglés A</p>
                        </div>
                        <div 
                            className={`type ${filtro === "Inglés B" ? "all" : ""}`} 
                            onClick={() => setFiltro("Inglés B")} 
                            style={{ cursor: 'pointer' }}
                        >
                            <p>Inglés B</p>
                        </div>
                    </div>

                    <div className="material-title">
                        <h2>Material Publicado</h2>
                    </div>

                    <div className="material-info">
                        <div className="material-side">
                            {columnaIzquierda.map(mat => (
                                <div className="material-data" key={mat.id}>
                                    <h3>{mat.titulo}</h3>
                                    <p>{mat.tipo} - {mat.clase}</p>
                                    <div 
                                        className="material-button" 
                                        onClick={() => abrirMaterial(mat)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <p>Ver material</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="material-side">
                            {columnaDerecha.map(mat => (
                                <div className="material-data" key={mat.id}>
                                    <h3>{mat.titulo}</h3>
                                    <p>{mat.tipo} - {mat.clase}</p>
                                    <div 
                                        className="material-button" 
                                        onClick={() => abrirMaterial(mat)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <p>Ver material</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PANEL DERECHO */}
                <div className="material-right">
                    <h2>Subir Nuevo Material</h2>
                    
                    <div className="exam-form" style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Título material</p>
                        <input 
                            type="text" 
                            placeholder="Ej: Lección 3" 
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div className="exam-form" style={{ marginBottom: '1.5rem' }}>
                         <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Tipo de material</p>
                        <div className="space" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div 
                                className="space-form" 
                                onClick={() => setNuevoTipo("PDF/Doc")}
                                style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: '10px', backgroundColor: nuevoTipo === "PDF/Doc" ? '#6883BA' : '#f0f0f0', color: nuevoTipo === "PDF/Doc" ? 'white' : 'black' }}
                            >
                                <p>PDF/Doc</p>
                            </div>
                            <div 
                                className="space-form" 
                                onClick={() => setNuevoTipo("Enlace externo")}
                                style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: '10px', backgroundColor: nuevoTipo === "Enlace externo" ? '#6883BA' : '#f0f0f0', color: nuevoTipo === "Enlace externo" ? 'white' : 'black' }}
                            >
                                <p>Enlace</p>
                            </div> 
                        </div>
                        <div className="space" style={{ display: 'flex', gap: '1rem' }}>
                            <div 
                                className="space-form" 
                                onClick={() => setNuevoTipo("Imagen")}
                                style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: '10px', backgroundColor: nuevoTipo === "Imagen" ? '#6883BA' : '#f0f0f0', color: nuevoTipo === "Imagen" ? 'white' : 'black' }}
                            >
                                <p>Imagen</p>
                            </div>
                            <div 
                                className="space-form" 
                                onClick={() => setNuevoTipo("Video")}
                                style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: '10px', backgroundColor: nuevoTipo === "Video" ? '#6883BA' : '#f0f0f0', color: nuevoTipo === "Video" ? 'white' : 'black' }}
                            >
                                <p>Video</p>
                            </div> 
                        </div>
                    </div>

                    {/* ZONA DE CARGA DINÁMICA */}
                    {renderizarZonaCarga()}

                    <div className="exam-form" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Clase</p>
                        <select 
                            value={nuevaClase}
                            onChange={(e) => setNuevaClase(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ccc' }}
                        >
                            <option value="Inglés A">Inglés A</option>
                            <option value="Inglés B">Inglés B</option>
                        </select>
                    </div>

                    <div className="material-save" onClick={publicarMaterial} style={{ cursor: 'pointer' }}>
                        <p>Publicar Material</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Material;