import "./tutor-ligas.css";

function Ligas() {
    return (
        <div className="ligas">
            <div className="sessions-list">
                <div className="list-title">
                    <p>Clases</p>
                </div>
                <div className="list-classes">
                    <div className="class-item">
                        <p>Inglés A</p>
                        <p className="info-class">Lunes y Jueves<br/></p>
                        <p className="info-class">3:10 p.m. - 4:50p.m.</p>
                        <p className="info-student">Luis Antonio Salinas</p>
                    </div>
                    <div className="class-item active">
                        <p>Inglés B</p>
                        <p className="info-class">Lunes y Miércoles</p>
                        <p className="info-class">5:10 p.m. - 6:50p.m.</p>
                        <p className="info-student">Roberto Castro</p>
                    </div>
                </div>
            </div>

        <div className="ligas-content">
            <div className="blue-rectangle">
                <h2>Roberto Castro</h2>
                <p>Inglés B</p>
                <div className="hours">
                    <p>Lunes y Miércoles</p>
                    <p>5:10 p.m. - 6:50 p.m.</p>
                </div>
            </div>

            <div className="info-rectangle">
                <h3>Liga de clases</h3>
                <div className="line"></div>
                <div className="link">
                    <p>Liga</p>
                    <div className="link-zoom">
                        <p>https://zoom.us/j/98765432100?pwd=abc123xyz</p>
                    </div>
                    
                </div>
                <div className="select-platform">
                    <p>Plataforma</p>
                    <div className="platform">
                        <p className="day active">Zoom</p>
                        <p className="day">Meet</p>
                        <p className="day">Teams</p>
                        <p className="day">Otro</p>
                    </div>
                </div>
                <div className="extra">
                    <div className="id">
                        <p>ID reunión (Opcional)</p>
                        <div className="data">
                        </div>
                    </div>
                    <div className="password">
                        <p>Contraseña (Opcional)</p>
                        <div className="data">
                        </div>
                    </div>
                </div>
                <div className="save">
                    <div className="button">
                        <p>Guardar Liga</p>
                    </div>
                </div>
            </div>
        </div>

        </div>
    );
}

export default Ligas;