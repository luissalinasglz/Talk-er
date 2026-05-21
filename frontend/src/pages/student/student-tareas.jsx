import "./student-tareas.css";


function StudentTareas() {
    return(
        <div className="tareas-student">
            <div className="line-student"></div>
            
            <div className="student-homework-sides">
                <div className="homework-left">
                    <h3>Pendientes</h3>
                    <div className="homework-urgent">
                        <h4>Urgente</h4>
                        <div className="homework-student-general">
                            <div className="circle-student-red"></div>
                            <div className="homework-student-detail">
                                <p>Lección del verbo to be</p>
                                <h5>Inglés - Vence hoy</h5>
                            </div>
                        </div>
                    </div>
                    <div className="homework-next">
                        <h4>Esta Semana</h4>
                        <div className="homework-student-general">
                            <div className="circle-student-orange"></div>
                            <div className="homework-student-detail">
                                <p>Lección de vocabulario</p>
                                <h5>Frances - Vence mañana</h5>
                            </div>
                        </div>
                        <div className="homework-student-general">
                            <div className="circle-student-orange"></div>
                            <div className="homework-student-detail">
                                <p>Dialogo del pasado simple</p>
                                <h5>Inglés - Vence el jueves</h5>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="homework-right">
                    <div className="homework-details-student">
                        <h2>Lección del Verbo To Be</h2>
                        <p>Inglés - Vence hoy</p>
                        <div className="homework-indications">
                            <h3>Indicaciones</h3>
                            <p>Completa los ejercicios de la página 24 de tu 
                                libro de trabajo. Escribe 5 oraciones usando el 
                                verbo "to be" en presente simple, afirmativo, 
                                negativo e interrogativo. Adjunta tu respuesta en 
                                formato PDF o imagen.</p>
                        </div>
                    </div>
                    <div className="homework-sent">
                        <h2>Entregar Tarea</h2>
                        <div className="file-sent">
                            <p>Haz Click para adjuntar un archivo o 
                                arrastra un archivo aquí PDF, Word, 
                                Imagen</p>
                        </div>
                    </div>
                    <div className="homework-save">
                        <p>Enviar Tarea</p>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default StudentTareas