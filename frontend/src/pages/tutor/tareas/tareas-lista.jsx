import "../tutor-tareas.css";

function TareasLista({ tareas, onSeleccionar }) {
  return (
    <div className="homework-list">
      <h3>Tareas Activas</h3>
      
      {tareas.length === 0 ? (
        <p>No hay tareas activas en este momento.</p>
      ) : (
        tareas.map((tarea) => (
          <div
            key={tarea.id}
            className="homework-item"
            onClick={() => onSeleccionar(tarea)}
            style={{ cursor: "pointer" }}
          >
            <div className="homework-indicator"></div>
            <div className="homework-info">
              <p className="homework-name">{tarea.titulo}</p>
              <p className="homework-date">
                Vence {tarea.fechaEntrega} a las {tarea.horaLimite}
              </p>
            </div>
            <p className="homework-class">{tarea.beneficiario}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default TareasLista;