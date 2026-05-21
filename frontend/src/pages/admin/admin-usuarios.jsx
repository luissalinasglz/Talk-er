import "./admin-usuarios.css";

function AdminUsuarios() {
    const usuarios = [
        { nombre: "Otrebor Castro", email: "otrebor.castro@gmail.com", rol: "Alumno", rolColor: "alumno", idioma: "Inglés", estado: "Activo", estadoColor: "activo" },
        { nombre: "Wicho Toño", email: "wicho.toño@gmail.com", rol: "Alumno", rolColor: "alumno", idioma: "Inglés/Frances", estado: "Activo", estadoColor: "activo" },
        { nombre: "Harry Potter", email: "a01123456@tec.mx", rol: "Tutor", rolColor: "tutor", idioma: "Inglés", estado: "Activo", estadoColor: "activo" },
        { nombre: "Ron Weasley", email: "a01123456@tec.mx", rol: "Tutor", rolColor: "tutor", idioma: "Inglés", estado: "Activo", estadoColor: "activo" },
        { nombre: "Hermione Granger", email: "a01123456@tec.mx", rol: "Tutor", rolColor: "tutor", idioma: "Frances", estado: "Activo", estadoColor: "activo" },
        { nombre: "Cedric Diggory", email: "a01123456@tec.mx", rol: "Revisor", rolColor: "revisor", idioma: "-", estado: "Activo", estadoColor: "activo" },
        { nombre: "Cho Chang", email: "a01123456@tec.mx", rol: "Revisor", rolColor: "revisor", idioma: "-", estado: "Inactivo", estadoColor: "inactivo" },
    ];

    return(
        <div className="usuarios-admin">
            <div className="user-line"></div>

            <div className="users-admin">
                <div className="user-left">
                    <div className="type-users">
                        <div className="options-user">
                            <div className="opti-user active-user">
                                <p>Todos</p>
                            </div>
                            <div className="opti-user">
                                <p>Alumnos</p>
                            </div>
                            <div className="opti-user">
                                <p>Tutores</p>
                            </div>
                            <div className="opti-user">
                                <p>Revisores</p>
                            </div>
                        </div>
                        <div className="add-user">
                            <p>+ Nuevo usuario</p>
                        </div>
                    </div>

                    <div className="table-users">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuarios</th>
                                    <th>Rol</th>
                                    <th>Idioma</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u, i) => (
                                    <tr key={i} className="user-row">
                                        <td>
                                            <p className="user-nombre">{u.nombre}</p>
                                            <p className="user-email">{u.email}</p>
                                        </td>
                                        <td>
                                            <div className={`rol-badge ${u.rolColor}`}>{u.rol}</div>
                                        </td>
                                        <td>
                                            <p className="user-idioma">{u.idioma}</p>
                                        </td>
                                        <td>
                                            <div className={`estado-badge-user ${u.estadoColor}`}>{u.estado}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="user-right">
                    <h3>Editar Usuario - Otrebor Castro</h3>
                    <div className="data-user">
                        <div className="data-detail">
                            <div className="user-detail">
                                <p>Nombre(s)</p>
                                <input type="text" placeholder="Otrebor" />
                            </div>
                            <div className="user-detail">
                                <p>Apellidos</p>
                                <input type="text" placeholder="Castro" />
                            </div>
                        </div>
                        <div className="data-detail">
                            <div className="user-detail">
                                <p>Correo eléctronico</p>
                                <input type="text" placeholder="otrebor.castro@gmail.com" />
                            </div>
                        </div>
                        <div className="data-detail">
                            <div className="user-detail">
                                <p>Rol</p>
                                <input type="text" placeholder="Alumno" />
                            </div>
                            <div className="user-detail">
                                <p>Estado</p>
                                <input type="text" placeholder="Activo" />
                            </div>
                        </div>
                        <div className="data-detail">
                            <div className="user-detail">
                                <p>Idioma</p>
                                <input type="text" placeholder="Inglés" />
                            </div>
                            <div className="user-detail">
                                <p>Nivel</p>
                                <input type="text" placeholder="A2" />
                            </div>
                        </div>
                        <div className="tutor-assigned">
                            <h4>Tutor Asignado</h4>
                            <div className="tutor-assigned-data">
                                <p>Harry Potter</p>
                                <p>Inglés</p>
                                <p className="unlink">Desvincular</p>
                            </div>
                        </div>
                        <div className="save-changes">
                            <p>Guardar Cambios</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default AdminUsuarios