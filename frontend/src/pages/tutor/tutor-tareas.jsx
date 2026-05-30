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
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTareas();
    fetchGrupos();
  }, []);

  async function fetchTareas() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/tutor/tareas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setTareas(data);
      } else {
        setError(data.message || "Error obteniendo tareas");
      }
    } catch (err) {
      setError("Error de conexión al cargar tareas");
      console.error("Error obteniendo tareas", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGrupos() {
    try {
      const res = await fetch(`${API_URL}/tutor/my-groups`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setGrupos(data);
      } else {
        console.error("Error obteniendo grupos:", data.message);
      }
    } catch (err) {
      console.error("Error obteniendo grupos", err);
    }
  }

  async function handleCrearTarea(nuevaTarea) {
    try {
      const res = await fetch(`${API_URL}/tutor/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        alert(data.message || "Error al crear la tarea");
      }
    } catch (err) {
      console.error("Error creando tarea", err);
      alert("Error de conexión al crear la tarea");
    }
  }

  async function handleEditarTarea(tareaEditada) {
    try {
      const res = await fetch(`${API_URL}/tutor/tareas/${tareaEditada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tareaEditada),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchTareas();
        setTareaActiva(tareaEditada);
        setVista("detalle");
      } else {
        console.error(data.message);
        alert(data.message || "Error al editar la tarea");
      }
    } catch (err) {
      console.error("Error editando tarea", err);
      alert("Error de conexión al editar la tarea");
    }
  }

  const renderContenido = () => {
    if (loading) return <p style={{ color: "black", padding: "2rem" }}>Cargando tareas...</p>;
    if (error) return <p style={{ color: "red", padding: "2rem" }}>{error}</p>;

    if (tab === "crear") {
      return <TareasCrear grupos={grupos} onCrear={handleCrearTarea} />;
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
            onClick={() => { setTab("gestionar"); setVista("lista"); }}
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
