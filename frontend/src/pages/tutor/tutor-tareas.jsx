import { useState } from "react";
import "./tutor-tareas.css";
import TareasLista from "./tareas/tareas-lista";
import TareasDetalle from "./tareas/tareas-detalle";
import TareasEditar from "./tareas/tareas-editar";
import TareasCrear from "./tareas/tareas-crear";

function Tareas() {
  const [tab, setTab] = useState("gestionar");
  const [vista, setVista] = useState("lista");
  const [tareaActiva, setTareaActiva] = useState(null);

  const [tareas, setTareas] = useState([
    {
      id: 1,
      titulo: "Lección del verbo to be",
      descripcion: "Completa los ejercicios de la página 24 de tu libro de trabajo. Escribe 5 oraciones usando el verbo 'to be'.",
      beneficiario: "Inglés A",
      fechaEntrega: "2026-04-28",
      horaLimite: "23:59",
      archivo: "Verbo_to_be.pdf",
    },
    {
      id: 2,
      titulo: "Lección pasado simple",
      descripcion: "Escribe un ensayo corto de 300 palabras sobre tus últimas vacaciones usando el pasado simple.",
      beneficiario: "Inglés B",
      fechaEntrega: "2026-04-30",
      horaLimite: "18:00",
      archivo: "Past_Simple_Guide.pdf",
    },
  ]);

  const handleCrearTarea = (nuevaTarea) => {
    const tareaConId = { ...nuevaTarea, id: Date.now() };
    setTareas([...tareas, tareaConId]);
    setTab("gestionar");
    setVista("lista");
  };

  const handleEditarTarea = (tareaEditada) => {
    const tareasActualizadas = tareas.map((t) =>
      t.id === tareaEditada.id ? tareaEditada : t
    );
    setTareas(tareasActualizadas);
    setTareaActiva(tareaEditada);
    setVista("detalle");
  };

  const renderContenido = () => {
    if (tab === "crear") {
      return <TareasCrear onCrear={handleCrearTarea} />;
    }
    if (vista === "lista") {
      return (
        <TareasLista
          tareas={tareas}
          onSeleccionar={(t) => {
            setTareaActiva(t);
            setVista("detalle");
          }}
        />
      );
    }
    if (vista === "detalle") {
      return (
        <TareasDetalle
          tarea={tareaActiva}
          onEditar={() => setVista("editar")}
          onVolver={() => setVista("lista")}
        />
      );
    }
    if (vista === "editar") {
      return (
        <TareasEditar
          tarea={tareaActiva}
          onGuardar={handleEditarTarea}
          onCancelar={() => setVista("detalle")}
        />
      );
    }
  };

  return (
    <div className="tareas">
      <div className="homework-header">
        <div className="line-homework"></div>
        <div className="homework-tabs">
          <div
            className={`tab ${tab === "gestionar" ? "active" : ""}`}
            onClick={() => {
              setTab("gestionar");
              setVista("lista");
            }}
          >
            Gestionar Tareas
          </div>
          <div
            className={`tab ${tab === "crear" ? "active" : ""}`}
            onClick={() => setTab("crear")}
          >
            Crear Tarea
          </div>
        </div>
      </div>

      <div className="homework-content">{renderContenido()}</div>
    </div>
  );
}

export default Tareas;