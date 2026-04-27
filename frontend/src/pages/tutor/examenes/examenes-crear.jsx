import { useState } from "react";
import "../tutor-examenes.css";

function ExamenesCrear({ onVolver }) {
    const [listaPreguntas, setListaPreguntas] = useState([{ id: Date.now(), correcta: null }]);

    const agregarNuevaPregunta = () => {
        setListaPreguntas([...listaPreguntas, { id: Date.now(), correcta: null }]);
    };

    const eliminarPregunta = (idParaEliminar) => {
        setListaPreguntas(listaPreguntas.filter((pregunta) => pregunta.id !== idParaEliminar));
    };

    const marcarCorrecta = (idPregunta, opcion) => {
        setListaPreguntas(listaPreguntas.map(p => 
            p.id === idPregunta ? { ...p, correcta: opcion } : p
        ));
    };

    const guardarExamen = () => {
        alert("¡Examen guardado y publicado correctamente!");
        onVolver();
    };

    return (
        <div className="examenes-panel vista-centrada">
            <div className="panel-right w-100">
                <button className="button-add" onClick={onVolver} style={{ width: 'auto', marginBottom: '1rem' }}>
                    ← Volver
                </button>
                <h2>Crear Examen</h2>

                <div className="exam-form">
                    <p>Título examen</p>
                    <input type="text" className="exam-input" placeholder="Ej: Examen unidad 3" />
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Clase</p>
                            <select className="exam-input">
                                <option value="">Inglés (Nivel)</option>
                                <option value="A">Inglés A</option>
                                <option value="B">Inglés B</option>
                            </select>
                        </div>
                        <div className="right-space">
                            <p>Duración (min)</p>
                            <input type="number" className="exam-input" placeholder="45" />
                        </div>
                    </div>
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Fecha límite</p>
                            <input type="date" className="exam-input" />
                        </div>
                        <div className="right-space">
                            <p>Hora límite</p>
                            <input type="time" className="exam-input" />
                        </div>
                    </div>
                </div>

                <div className="exam-questions">
                    <h3>Preguntas</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                        * Haz clic en el círculo de la opción que sea la respuesta correcta.
                    </p>

                    {listaPreguntas.map((pregunta, index) => (
                        <div key={pregunta.id} className="questions-container" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            {listaPreguntas.length > 1 && (
                                <button
                                    className="button-delete"
                                    onClick={() => eliminarPregunta(pregunta.id)}
                                >
                                    ✕ Eliminar
                                </button>
                            )}

                            <p>Pregunta {index + 1} - Opción Múltiple</p>
                            <input type="text" className="question-input" placeholder="Escribe una pregunta" />

                            <div className="options-general">
                                <div className="left-options">
                                    <div className="options" onClick={() => marcarCorrecta(pregunta.id, 'A')} style={{ cursor: 'pointer' }}>
                                        <div className="option-circle" style={{ backgroundColor: pregunta.correcta === 'A' ? '#4CAF50' : '' }}></div>
                                        <input type="text" className="option-input" placeholder="Opción A" onClick={e => e.stopPropagation()} />
                                    </div>
                                    <div className="options" onClick={() => marcarCorrecta(pregunta.id, 'B')} style={{ cursor: 'pointer' }}>
                                        <div className="option-circle" style={{ backgroundColor: pregunta.correcta === 'B' ? '#4CAF50' : '' }}></div>
                                        <input type="text" className="option-input" placeholder="Opción B" onClick={e => e.stopPropagation()} />
                                    </div>
                                </div>
                                <div className="right-options">
                                    <div className="options" onClick={() => marcarCorrecta(pregunta.id, 'C')} style={{ cursor: 'pointer' }}>
                                        <div className="option-circle" style={{ backgroundColor: pregunta.correcta === 'C' ? '#4CAF50' : '' }}></div>
                                        <input type="text" className="option-input" placeholder="Opción C" onClick={e => e.stopPropagation()} />
                                    </div>
                                    <div className="options" onClick={() => marcarCorrecta(pregunta.id, 'D')} style={{ cursor: 'pointer' }}>
                                        <div className="option-circle" style={{ backgroundColor: pregunta.correcta === 'D' ? '#4CAF50' : '' }}></div>
                                        <input type="text" className="option-input" placeholder="Opción D" onClick={e => e.stopPropagation()} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="buttons-container">
                    <button className="button-add" onClick={agregarNuevaPregunta}>
                        + Agregar Pregunta
                    </button>
                    <button className="button-save" onClick={guardarExamen}>
                        Publicar examen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamenesCrear;