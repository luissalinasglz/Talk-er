import { useState, useEffect } from "react";
import "../tutor-examenes.css";

const API_URL = import.meta.env.VITE_API_URL;
const LETRAS = ["A", "B", "C", "D"];

function nuevaPregunta() {
    return { id: Date.now(), enunciado: "", opciones: ["", "", "", ""], correcta: null };
}

function ExamenesCrear({ onVolver }) {
    const [nombre, setNombre]           = useState("");
    const [clase, setClase]             = useState("");
    const [duracion, setDuracion]       = useState("");
    const [fechaLimite, setFechaLimite] = useState("");
    const [horaLimite, setHoraLimite]   = useState("");
    const [listaPreguntas, setListaPreguntas] = useState([nuevaPregunta()]);
    const [guardando, setGuardando]     = useState(false);
    const [error, setError]             = useState("");
    const [grupos, setGrupos]           = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/tutor/my-groups`, { credentials: "include" })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setGrupos(data); })
            .catch(console.error);
    }, []);

    const agregarNuevaPregunta = () =>
        setListaPreguntas(prev => [...prev, nuevaPregunta()]);

    const eliminarPregunta = (id) =>
        setListaPreguntas(prev => prev.filter(p => p.id !== id));

    const actualizarEnunciado = (id, valor) =>
        setListaPreguntas(prev =>
            prev.map(p => p.id === id ? { ...p, enunciado: valor } : p)
        );

    const actualizarOpcion = (id, indice, valor) =>
        setListaPreguntas(prev =>
            prev.map(p => {
                if (p.id !== id) return p;
                const opciones = [...p.opciones];
                opciones[indice] = valor;
                return { ...p, opciones };
            })
        );

    const marcarCorrecta = (id, letra) =>
        setListaPreguntas(prev =>
            prev.map(p => p.id === id ? { ...p, correcta: letra } : p)
        );

    const guardarExamen = async () => {
        setError("");

        if (!nombre.trim() || !clase || !duracion || !fechaLimite || !horaLimite) {
            setError("Completa todos los campos del encabezado.");
            return;
        }

        const incompleta = listaPreguntas.some(
            p => !p.enunciado.trim() ||
                 p.opciones.some(o => !o.trim()) ||
                 p.correcta === null
        );
        if (incompleta) {
            setError("Completa todas las preguntas, sus opciones y marca la respuesta correcta.");
            return;
        }

        const payload = {
            nombre: nombre.trim(),
            clase,
            duracion: parseInt(duracion),
            fecha_limite: `${fechaLimite}T${horaLimite}:00`,
            preguntas: listaPreguntas.map(p => ({
                enunciado: p.enunciado.trim(),
                opciones: p.opciones.map(texto => ({ texto: texto.trim() })),
                correcta: LETRAS.indexOf(p.correcta),
            })),
        };

        try {
            setGuardando(true);
            const res = await fetch(`${API_URL}/tutor/examenes`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al guardar");

            onVolver();
        } catch (err) {
            console.error(err);
            setError(err.message || "Error de conexión al guardar el examen.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="examenes-panel vista-centrada">
            <div className="panel-right w-100">
                <button className="button-add volver" onClick={onVolver}>
                    ← Volver
                </button>
                <h2>Crear Examen</h2>

                <div className="exam-form">
                    <p>Título del examen</p>
                    <input
                        type="text"
                        className="exam-input"
                        placeholder="Ej: Examen unidad 3"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                    />
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Clase</p>
                            <select className="exam-input" value={clase}
                                onChange={e => setClase(e.target.value)}>
                                <option value="">Seleccionar grupo...</option>
                                {grupos.map(g => (
                                    <option key={g.id} value={`${g.id}`}>
                                        {g.student_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="right-space">
                            <p>Duración (min)</p>
                            <input type="number" className="exam-input" placeholder="45"
                                value={duracion} onChange={e => setDuracion(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Fecha límite</p>
                            <input type="date" className="exam-input"
                                value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
                        </div>
                        <div className="right-space">
                            <p>Hora límite</p>
                            <input type="time" className="exam-input"
                                value={horaLimite} onChange={e => setHoraLimite(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="exam-questions">
                    <h3>Preguntas</h3>
                    <p className="exam-questions-hint">
                        * Haz clic en el círculo de la opción correcta.
                    </p>

                    {listaPreguntas.map((pregunta, index) => (
                        <div key={pregunta.id} className="questions-container">
                            {listaPreguntas.length > 1 && (
                                <button className="button-delete"
                                    onClick={() => eliminarPregunta(pregunta.id)}>
                                    ✕ Eliminar
                                </button>
                            )}

                            <p>Pregunta {index + 1} — Opción Múltiple</p>

                            <input
                                type="text"
                                className="question-input"
                                placeholder="Escribe la pregunta"
                                value={pregunta.enunciado}
                                onChange={e => actualizarEnunciado(pregunta.id, e.target.value)}
                            />

                            <div className="options-general">
                                <div className="left-options">
                                    {[0, 1].map(i => (
                                        <div key={i} className="options"
                                            onClick={() => marcarCorrecta(pregunta.id, LETRAS[i])}>
                                            <div className={`option-circle${pregunta.correcta === LETRAS[i] ? " selected" : ""}`} />
                                            <input
                                                type="text"
                                                className="option-input"
                                                placeholder={`Opción ${LETRAS[i]}`}
                                                value={pregunta.opciones[i]}
                                                onChange={e => actualizarOpcion(pregunta.id, i, e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="right-options">
                                    {[2, 3].map(i => (
                                        <div key={i} className="options"
                                            onClick={() => marcarCorrecta(pregunta.id, LETRAS[i])}>
                                            <div className={`option-circle${pregunta.correcta === LETRAS[i] ? " selected" : ""}`} />
                                            <input
                                                type="text"
                                                className="option-input"
                                                placeholder={`Opción ${LETRAS[i]}`}
                                                value={pregunta.opciones[i]}
                                                onChange={e => actualizarOpcion(pregunta.id, i, e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="form-error">{error}</p>}

                <div className="buttons-container">
                    <button className="button-add" onClick={agregarNuevaPregunta}>
                        + Agregar Pregunta
                    </button>
                    <button className="button-save" onClick={guardarExamen} disabled={guardando}>
                        {guardando ? "Guardando..." : "Publicar examen"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamenesCrear;
