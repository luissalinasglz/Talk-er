import "./tutor-sesiones.css";

function Sesiones() {
    return (
        <div className="sesiones">
            <div className="sesiones-lista">
                <div className="lista-titulo">
                    <p>Clases</p>
                </div>
                <div className="lista-clases">
                    <p className="clase active">Inglés A</p>
                    <p className="clase">Inglés B</p>
                </div>
            </div>

        <div className="sesiones-contenido">
        </div>

        </div>
    );
}

export default Sesiones;