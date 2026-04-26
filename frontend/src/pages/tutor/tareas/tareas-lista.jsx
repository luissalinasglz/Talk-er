import "../tutor-tareas.css"

function TareasLista({ onSeleccionar }) {
  const tareas = [
    { id: 1, nombre: "Lección del verbo to be", vence: "hoy - 11:59 p.m.", grupo: "Inglés A" },
    { id: 2, nombre: "Lección pasado simple",   vence: "hoy - 11:59 p.m.", grupo: "Inglés B" },
  ];

  return (
    <div className="homework-list">
      <h3>Tareas Activas</h3>
      {tareas.map((tarea) => (
        <div key={tarea.id} className="homework-item" onClick={() => onSeleccionar(tarea)}>
          <div className="homework-indicator"></div>
          <div className="homework-info">
            <p className="homework-name">{tarea.nombre}</p>
            <p className="homework-date">Vence {tarea.vence}</p>
          </div>
          <p className="homework-class">{tarea.grupo}</p>
        </div>
      ))}
    </div>
  );
}

export default TareasLista;