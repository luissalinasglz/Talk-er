import "../tutor-examenes.css"

function ExamenesResultados({ examen, onVolver }) {
    return (
        <div className="examenes-resultados">
            <div className="results-left">
                {/* Botón para regresar */}
                <button className="button-add" onClick={onVolver} style={{ width: 'auto', marginBottom: '1.5rem', backgroundColor: '#e0e0e0', color: '#333' }}>
                    ← Volver al Panel
                </button>
                
                <h2>Resultados - Examen: Verbo To Be</h2>
                <div className="general-info">
                    <div className="student-info">
                        <h3>Luis Antonio Salinas</h3>
                        <p>Inglés A</p>
                    </div>
                    <div className="cal-info">
                        <div className="circle-cal">
                            <p>100/100</p>
                        </div>
                    </div>
                </div>

                <div className="exam-information">
                    <div className="answers">
                        <p>Correctas</p>
                        <p>20</p>
                    </div>
                    <div className="answers">
                        <p>Incorrectas</p>
                        <p>0</p>
                    </div>
                    <div className="answers">
                        <p>Tiempo</p>
                        <p>25min</p>
                    </div>
                </div>

                <div className="exam-data">
                    <div className="number-question">
                        <p>1</p>
                    </div>
                    <div className="questions">
                        <div className="question-detail">
                            <p>¿Cuál de las siguientes oraciones 
                                usa correctamente el verbo "to be" 
                                en presente?</p>
                        </div>
                        <div className="options-general-results">
                            <div className="answers-side">
                                <div className="answers-left">
                                    <div className="option-circle"></div>
                                    <p>She are a student</p>
                                </div>
                                <div className="answers-left">
                                    <div className="option-circle"></div>
                                    <p>She am a student</p>
                                </div>
                            </div>
                            <div className="answers-side">
                                <div className="answers-right correct">
                                    <div className="option-circle correct"></div>
                                    <p>She is a student</p>
                                </div>
                                <div className="answers-right">
                                    <div className="option-circle"></div>
                                    <p>She be a student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="results-right">
                <h2>Retroalimentación</h2>
                <p>Mensaje al alumno:</p>
                <textarea 
                    className="feedback-input" 
                    placeholder="Ej: Muy buen trabajo, solo recuerda repasar las expresiones..."
                ></textarea>
                <button className="button-save" style={{marginTop: '1rem', width: '100%'}}>Enviar Feedback</button>
            </div>
        </div>
    );
}

export default ExamenesResultados;