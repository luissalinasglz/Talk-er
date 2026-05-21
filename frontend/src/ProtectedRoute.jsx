import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const roleRoutes = {
    admin: "/admin",
    supervisor: "/supervisor",
    teacher: "/tutor",
    student: "/student",
};

export default function ProtectedRoute({ allowedRole, children }) {
    const [status, setStatus] = useState("loading"); 
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/user`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    setStatus("unauth");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                const role = data.data?.[0]?.role;
                setUserRole(role);
                if (role !== allowedRole) {
                    setStatus("wrong-role");
                } else {
                    setStatus("ok");
                }
            })
            .catch(() => setStatus("unauth"));
    }, [allowedRole]);

    if (status === "loading") return null;
    if (status === "unauth") return <Navigate to="/" replace />;
    if (status === "wrong-role") return <Navigate to={roleRoutes[userRole]} replace />;
    return children;
}
