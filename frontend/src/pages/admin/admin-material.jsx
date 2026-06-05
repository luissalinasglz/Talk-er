import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "./adminApi";
import "./admin-material.css";

const TIPOS = ["TODOS", "PDF", "DOC", "IMAGE", "VIDEO", "LINK"];

function AdminMaterial() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [idiomaFilter, setIdiomaFilter] = useState("");
  const [search, setSearch]         = useState("");

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tipoFilter !== "TODOS") params.set("type", tipoFilter);
      if (idiomaFilter)           params.set("idioma", idiomaFilter);
      if (search)                 params.set("search", search);
      const data = await apiFetch(`/materials?${params.toString()}`);
      setMaterials(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tipoFilter, idiomaFilter, search]);

  useEffect(() => {
    const t = setTimeout(loadMaterials, 300);
    return () => clearTimeout(t);
  }, [loadMaterials]);

  const typeIcon = (t) => {
    const icons = { PDF: "📄", DOC: "📝", IMAGE: "🖼️", VIDEO: "🎬", LINK: "🔗" };
    return icons[t] ?? "📁";
  };

  const idioma = (i) =>
    i === "english" ? "Inglés" : i === "french" ? "Francés" : i ?? "—";

  return (
    <div className="material-admin">
      {/* Filters */}
      <div className="type-material-admin">
        <div className="options-material">
          {TIPOS.map((t) => (
            <div
              key={t}
              className={`opti-material${tipoFilter === t ? " active-material" : ""}`}
              onClick={() => setTipoFilter(t)}
              style={{ cursor: "pointer" }}
            >
              <p>{t.charAt(0) + t.slice(1).toLowerCase()}</p>
            </div>
          ))}
          <div
            className={`opti-material${idiomaFilter === "english" ? " active-material" : ""}`}
            onClick={() => setIdiomaFilter(idiomaFilter === "english" ? "" : "english")}
            style={{ cursor: "pointer" }}
          >
            <p>Inglés</p>
          </div>
          <div
            className={`opti-material${idiomaFilter === "french" ? " active-material" : ""}`}
            onClick={() => setIdiomaFilter(idiomaFilter === "french" ? "" : "french")}
            style={{ cursor: "pointer" }}
          >
            <p>Francés</p>
          </div>
        </div>
        <input
          className="search-material"
          type="text"
          placeholder="Buscar material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", cursor: "text" }}
        />
      </div>

      {/* Content */}
      {loading && <p style={{ padding: "2rem", color: "#000" }}>Cargando materiales...</p>}
      {error   && <p style={{ padding: "2rem", color: "red" }}>{error}</p>}

      {!loading && !error && materials.length === 0 && (
        <p style={{ padding: "2rem", color: "#888" }}>No hay materiales con ese filtro.</p>
      )}

      {!loading && !error && (
        <div className="mat-admin">
          {/* Grid — chunk into rows of 3 */}
          {Array.from({ length: Math.ceil(materials.length / 3) }, (_, rowIdx) => (
            <div key={rowIdx} className="material-side-admin">
              {materials.slice(rowIdx * 3, rowIdx * 3 + 3).map((m) => (
                <div key={m.id} className="material-data-admin">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{typeIcon(m.type)}</span>
                    <h3>{m.title}</h3>
                  </div>
                  <p style={{ color: "#888", fontSize: "0.85rem", margin: "0.25rem 0" }}>
                    {m.type} · {idioma(m.idioma)}
                  </p>
                  <p style={{ color: "#aaa", fontSize: "0.75rem", margin: "0.25rem 0 0.5rem" }}>
                    {m.tutor_name} → {m.alumno_name}
                  </p>
                  <p style={{ color: "#aaa", fontSize: "0.75rem" }}>
                    {new Date(m.uploaded_at).toLocaleDateString("es-MX")}
                  </p>
                  {(m.signed_file_url || m.external_url) && (
                    <a
                      href={m.signed_file_url ?? m.external_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="material-button-admin">
                        <p>Ver material</p>
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminMaterial;
