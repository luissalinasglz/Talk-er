import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const navigate = useNavigate();

    const roleRoutes = {
        admin: "/admin",
        supervisor: "/supervisor",
        teacher: "/tutor",
        student: "/student",
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username: user, password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                const userData = data.data[0];
                const target = roleRoutes[userData.role];
                if (target) {
                    navigate(target);
                }
            } else {
                setMessage(data.message || "Error desconocido");
            }
        } catch (error) {
            setMessage("Error de conexión con el servidor");
        }
    };

    const handleOnChange = (e) => {
        setIsChecked(e.target.checked);
    };

    return (
        <div className="login-container">
            <div className="header">Talk-er</div>

            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Bienvenido</h2>

                <label>Usuario </label>
                <input data-cy="username-input" type="text" value={user} onChange={(e) => setUser(e.target.value)} required />

                <label>Contraseña</label>
                <input data-cy="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <label>
                    <input type="checkbox" checked={isChecked} onChange={handleOnChange} /> Recuérdame
                </label>

                <button data-cy="login-btn" type="submit">Iniciar sesión</button>
            </form>

            {message && <p className="error-message" data-cy="error-message">{message}</p>}
        </div>
    );
}
