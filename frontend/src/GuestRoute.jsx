import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const roleRoutes = {
    admin: "/admin",
    supervisor: "/supervisor",
    teacher: "/tutor",
    student: "/student",
};

export default function GuestRoute({ children }) {
    const [status, setStatus] = useState("loading");
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/user`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    setStatus("guest");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setUserRole(data.data?.[0]?.role);
                setStatus("auth");
            })
            .catch(() => setStatus("guest"));
    }, []);

    if (status === "loading") return null;
    if (status === "auth") return <Navigate to={roleRoutes[userRole]} replace />;
    return children;
}
