import "./student-examenes.css";

function StudentExamenes() {
    return(
        <div className="examenes-student">
            <div className="available">
                <h2>Disponibles</h2>
                <div className="exam-available">
                    <div className="exam-detail">
                        <h3>Examen Unidad 2</h3>
                        <p>Inglés</p>
                        <p>45 min - 25 preguntas</p>
                        <div className="exam-button">
                            <p>Empezar Examen</p>
                        </div>
                    </div>
                    <div className="exam-detail">
                        <h3>Examen Unidad 2</h3>
                        <p>Inglés</p>
                        <p>45 min - 25 preguntas</p>
                        <div className="exam-button">
                            <p>Empezar Examen</p>
                        </div>
                    </div>
                </div>
                <div className="exam-results">
                    <h2>Calificados</h2>
                    <div className="exam-calification-student">
                        <div className="exam-calification">
                            <div className="student-cal">
                                <div className="circle-calification-student">
                                    <h3>9.6</h3>
                                </div>
                                <div className="student-exam-detail">
                                    <h3>Examen Unidad 1</h3>
                                    <p>Inglés</p>
                                    <p>Entregado 11 de mayo</p>
                                </div>
                            </div>
                            
                            <div className="exam-cal-button">
                                <p>Ver retroalimentación</p>
                            </div>
                        </div>
                        <div className="exam-calification">
                            <div className="student-cal">
                                <div className="circle-calification-student pass">
                                    <h3>6.0</h3>
                                </div>
                                <div className="student-exam-detail">
                                    <h3>Examen Unidad 1</h3>
                                    <p>Inglés</p>
                                    <p>Entregado 11 de mayo</p>
                                </div>
                            </div>
                            <div className="exam-cal-button">
                                <p>Ver retroalimentación</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default StudentExamenes