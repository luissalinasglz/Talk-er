import "../tutor-tareas.css"
import documentoazul from "../../../assets/documento_tarea.png"

function TareasCrear({ tarea }) {
    return (
        <div className="homework-form">
            <h3>Crear Tarea</h3>

            <div className="form-group">
                    <p>Beneficiario</p>
                    <div className="select-input">
                        <p>Seleccionar beneficiario</p>
                    </div>
            </div>

            <div className="form-group">
                <p>Titulo</p>
                <div className="select-input">
                    <p>Escribir titulo</p>
                </div>
            </div>
            
            <div className="form-group">
                <p>Descripción</p>
                <div className="select-input">
                    <p>Explicar actividad</p>
                </div>
            </div>
            
            <div className="form-group">
                <p>Material de apoyo</p>
                <div className="file-attach">
                    <img className="blue-document" src={documentoazul}/>
                    <p>Verbo_to_be.pdf</p>
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-date">
                    <p>Fecha de entrega</p>
                    <div className="select-input">dd/mm/aaaa</div>
                </div>
                <div className="form-hour">
                    <p>Hora límite</p>
                    <div className="select-input">--:--</div>
                </div>
            </div>
            
            <div className="save">
                <div className="button">Subir Tarea</div>
            </div>
        </div>
    );
}

export default TareasCrear;