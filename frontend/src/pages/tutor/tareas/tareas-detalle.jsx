import "../tutor-tareas.css"
import documentoazul from "../../../assets/documento_tarea.png"

function TareasDetalle({ tarea, onEditar }) {
  return (
    <div className="homework-details">
        <div className="detail-left">
            <div className="indications">
                <div className="indications-details">
                    <h3>Indicaciones</h3>
                    <p>Completa los ejercicios de la página 24 de tu 
                    libro de trabajo. Escribe 5 oraciones usando 
                    el verbo "to be" en presente simple, 
                    afirmativo, negativo e interrogativo. 
                    Adjunta tu respuesta en formato PDF o 
                    imagen.</p>
                </div>
                <div className="file">
                    <p>diapositivas_leccion.pdf</p>
                </div>
                <div className="save">
                    <div className="button-edite" onClick={onEditar}>Editar</div>
                </div>
            </div>
        </div>

        <div className="detail-right">
            <h3>Calificar Tarea - {tarea.nombre}</h3>
            <div className="student">
                <div className="circle-student"></div>
                <div className="name">
                    <p>Otrebor Castro</p>
                    <p className="info-date">Entregado hace 20min.</p>
                </div>
            </div>
            
            <div className="file-info">
                <img className="blue-document" src={documentoazul}/>
                <p>Verbo_to_be-Otrebor.pdf</p>
                <p className="ver">Ver</p>
            </div>
            <div className="calification">
                <div className="input-cal">
                    <p>0</p>
                </div>
                <div className="cal">
                    <p>/ 100</p>
                </div>  
            </div>
            
            <div className="feedback">
                <p>Retroalimentación para el estudiante...</p>
            </div>
            <div className="save">
                <div className="button">Guardar Calificación</div>
            </div>
        </div>

    </div>
  );
}

export default TareasDetalle;