import "../tutor-examenes.css"

function ExamenesPanel({ onSeleccionar }) {
    const examenes = [
        {
           id: 1, 
            nombre: "Examen del verbo to be", 
            vence: "hoy - 5:59 p.m.", 
            preguntas: 20, 
            duracion: 45, 
            clase: "Inglés A"  
        },
        { 
            id: 2, 
            nombre: "Examen pasado simple", 
            vence: "miércoles - 3:58 p.m.", 
            preguntas: 10, 
            duracion: 30, 
            clase: "Inglés B" 
        },
    ]
    return (
        <div className="examenes-panel">
            <div className="panel-left">
                <h2>Examenes Activos</h2>
                {examenes.map((examen) => (
                    <div key={examen.id} className="exam-item">
                        <div className="exam-header">
                            <div className="exam-indicator"></div>
                            <div className="exam-info">
                                <p className="exam-name">{examen.nombre}</p>
                                <p className="exam-date">
                                    Vence {examen.vence} · {examen.preguntas} preguntas · {examen.duracion}min
                                </p>
                            </div>
                            <p className="exam-class">{examen.clase}</p>
                        </div>
                        <p 
                            className="exam-link"
                            onClick={() => onSeleccionar(examen)}
                        >
                            Ver resultados →
                        </p>
                    </div>
                ))}
            </div>
            <div className="panel-right">
                <h2>Crear Examen</h2>
                <div className="exam-form">
                    <p>Titulo examen</p>
                    <div className="space-form">
                        <p>Ej:Examen unidad 3</p>
                    </div>
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Clase</p>
                            <div className="space-form">
                                <p>Inglés(Nivel)</p>
                            </div>
                        </div>
                        <div className="right-space">
                            <p>Duración(min)</p>
                            <div className="space-form">
                                <p>45</p>
                            </div>
                        </div> 
                    </div>
                </div>

                <div className="exam-form">
                    <div className="space">
                        <div className="left-space">
                            <p>Fecha límite</p>
                            <div className="space-form">
                                <p>dd/mm/aaaa</p>
                            </div>
                        </div>
                        <div className="right-space">
                            <p>Hora límite</p>
                            <div className="space-form">
                                <p>--:--</p>
                            </div>
                        </div> 
                    </div>
                </div>

                <div className="exam-questions">
                    <h3>Preguntas</h3>
                    <div className="questions-container">
                        <p>Pregunta 1 - Opción Múltiple</p>
                        <div className="question-space">
                            <p>Escribe una pregunta</p>
                        </div>
                        <div className="options-general">
                            <div className="left-options">
                                <div className="options">
                                    <div className="option-circle"></div>
                                    <div className="option-space">
                                        <p>Opción A</p>
                                    </div>
                                </div>
                                <div className="options">
                                    <div className="option-circle"></div>
                                    <div className="option-space">
                                        <p>Opción B</p>
                                    </div>
                                </div>
                            </div>
                            <div className="right-options">
                                <div className="options">
                                    <div className="option-circle"></div>
                                    <div className="option-space">
                                        <p>Opción C</p>
                                    </div>
                                </div>
                                <div className="options">
                                    <div className="option-circle"></div>
                                    <div className="option-space">
                                        <p>Opción D</p>
                                    </div>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>

                <div className="buttons-container">
                    <p className="button-add">Agregar Pregunta</p>
                    <p className="button-save">Publicar examen</p>
                </div>

            </div>
        </div>
    );
}

export default ExamenesPanel