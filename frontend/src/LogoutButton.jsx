import { NavLink, useNavigate } from "react-router-dom";
import logoutIcon from "../src/assets/logout.png";

function Logout() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/");
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      <img className="icon" src={logoutIcon} alt="" />
      <p>Cerrar Sesion</p>
    </button>
  )
}

export default Logout;