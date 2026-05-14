import "./supervisor-bitacoras.css";
import { useState, useEffect } from "react";

function SupervisorBitacoras() {
    const [bitacoras, setBitacoras] = useState([]);
    const [selectedBitacora, setSelectedBitacora] = useState(null);
    const [correcciones, setCorrecciones] = useState("");
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;


    useEffect(() => {
        fetchBitacoras();
    }, []);

    const fetchBitacoras = async () => {
        try {
            const response = await fetch(`${API_URL}/supervisor/bitacoras`);
            const data = await response.json();
            setBitacoras(data);
            if (data.length > 0) setSelectedBitacora(data[0]);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener bitácoras:", error);
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedBitacora) return;
        try {
            await fetch("/api/supervisor/correcciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: selectedBitacora.session_id,
                    validated: true,
                    approved: true,
                    corrections: ""
                })
            });
            alert("Bitácora aprobada");
            fetchBitacoras();
        } catch (error) {
            alert("Error al aprobar");
        }
    };

    const handleCorrection = async () => {
        if (!selectedBitacora || !correcciones) return alert("Escribe una corrección primero");
        try {
            await fetch("/api/supervisor/correcciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: selectedBitacora.session_id,
                    validated: false,
                    approved: false,
                    corrections: correcciones
                })
            });
            alert("Corrección enviada");
            setCorrecciones("");
            fetchBitacoras();
        } catch (error) {
            alert("Error al enviar corrección");
        }
    };

    if (loading) return <p>Cargando bitácoras...</p>;

  return (
        <div className="bitacoras-supervisor">
            <div className="bitacora-line"></div>

            <div className="bitacoras-content">
                <div className="bitacoras-left">
                    <h3>Mis Bitácoras</h3>
                    {bitacoras.length === 0 ? (
                        <p className="month">Sin pendientes</p>
                    ) : (
                        bitacoras.map((b) => (
                            <div 
                                key={b.id} 
                                className={`bitacora-item ${selectedBitacora?.id === b.id ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedBitacora(b);
                                    setCorrecciones(b.corrections || "");
                                }}
                            >
                                <p className="item-name">Sesión ID: {b.session_id}</p>
                                <p className="item-class">ID Tutor: {b.tutor_id}</p>
                            </div>
                        ))
                    )}
                </div>

                {bitacoras.length === 0 ? (
                    <div className="no-bitacoras-message">
                        <p>No tienes bitácoras pendientes por revisar en este momento.</p>
                    </div>
                ) : (
                    <>
                        <div className="bitacoras-right">
                            <h2>Detalle de Bitácora - Sesión {selectedBitacora?.session_id}</h2>
                            <div className="save">
                                <div className="button" onClick={handleApprove}>Aprobar Bitácora</div>
                            </div>       
                        </div>

                        <div className="bitacoras-review">
                            <h3 className="review-subtitle">Solicitar corrección</h3>
                            <textarea 
                                className="review-comments-area"
                                value={correcciones}
                                onChange={(e) => setCorrecciones(e.target.value)}
                                placeholder="Escribe aquí las observaciones para el tutor..."
                            />
                            <div className="review-buttons">
                                <div className="btn-correction" onClick={handleCorrection}>
                                    Enviar a Corrección
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SupervisorBitacoras;