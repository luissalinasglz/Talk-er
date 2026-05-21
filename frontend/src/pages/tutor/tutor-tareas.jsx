import { useEffect, useState } from "react";
import "./tutor-tareas.css";
import TareasLista from "./tareas/tareas-lista";
import TareasDetalle from "./tareas/tareas-detalle";
import TareasEditar from "./tareas/tareas-editar";
import TareasCrear from "./tareas/tareas-crear";

function Tareas() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [tab, setTab] = useState("gestionar");
  const [vista, setVista] = useState("lista");
  const [tareaActiva, setTareaActiva] = useState(null);

  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTareas();
  }, []);

  async function fetchTareas() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/tutor/tareas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setTareas(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error obteniendo tareas", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearTarea(nuevaTarea) {
    try {
      const res = await fetch(`${API_URL}/tutor/tareas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(nuevaTarea),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchTareas();
        setTab("gestionar");
        setVista("lista");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error creando tarea", error);
    }
  }

  async function handleEditarTarea(tareaEditada) {
    try {
      const res = await fetch(
        `${API_URL}/tutor/tareas/${tareaEditada.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(tareaEditada),
        }
      );

      const data = await res.json();

      if (res.ok) {
        await fetchTareas();

        setTareaActiva(tareaEditada);
        setVista("detalle");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error editando tarea", error);
    }
  }

  const renderContenido = () => {
    if (loading) {
      return <p>Cargando tareas...</p>;
    }

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

      <div className="homework-content">
        {renderContenido()}
      </div>
    </div>
  );
}

export default Tareas;
