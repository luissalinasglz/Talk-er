import "./student-sesiones.css";
import video from "../../assets/video.png";
import profileBlue from "../../assets/profile-blue.png";

function StudentSesiones() {
    const getSunday = (date) => {
        const day = new Date(date);
        const dayOf = day.getDay();
        day.setDate(day.getDate()-dayOf);
        return day;
    };

    const today = new Date();
    const sunday = getSunday(today);

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    const calendarDays = weekDays.map((name, i) => {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        return{
        name,
        number: day.getDate(),
        month: day.toLocaleDateString('es-MX', {month: 'short'})
        };
    });

    const firstDay = new Date(sunday);
    const lastDay = new Date(sunday);
    lastDay.setDate(sunday.getDate()+6);
    const weekTitle = `Semana ${firstDay.getDate()} de ${firstDay.toLocaleString('es-MX', { month: 'long' })} al ${lastDay.getDate()} de ${lastDay.toLocaleString('es-MX', { month: 'long' })}`;
    
    return(
        <div className="sesiones-student">
            <div className="session-student-general">
                <div className="session-details">
                    <div className="image-video">
                        <img className="video-student" src={video} alt="video" />
                    </div>
                    <div className="session-details-student">
                        <p>Próxima sesión</p>
                        <h2>Inglés</h2>
                        <p>Hoy lunes de 3:10 p.m. - 4:50 p.m.</p>
                    </div>
                </div>
                <div className="link-join-student">
                    <h3>Unirse a la reunión</h3>
                </div>
            </div>

            <div className="student-side">
                <div className="left-session-student">
                    <h3>{weekTitle}</h3>
                    <table className="calendario">
                    <thead>
                        <tr>
                        <th></th>
                        {calendarDays.map((day, i) => (
                            <th key={i}>{day.name} {day.number}</th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td className="hora">2:00</td>
                        <td></td>
                        <td rowspan={2}>
                            <div className="evento">
                            <p>Inglés</p> 
                            <p>3:10 - 4:50</p>
                            </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td rowspan={2}>
                            <div className="evento">
                            <p>Inglés</p> 
                            <p>3:10 - 4:50</p>
                            </div>
                        </td>
                        <td></td>
                        <td></td>
                        </tr>
                        <tr>
                        <td className="hora">3:00</td>
                        <td></td>
        
                        <td></td>
                        <td></td>
                        
                        <td></td>
                        <td></td>
                        </tr>
                        <tr>
                        <td className="hora">4:00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>
                        <tr>
                        <td className="hora">5:00</td>
                        <td></td>
                        <td rowspan={2}>
                            <div className="evento">
                            <p>Frances</p> 
                            <p>5:10 - 6:50</p>
                            </div>
                        </td>
                        <td></td>
                        <td rowspan={2}>
                            <div className="evento">
                            <p>Frances</p> 
                            <p>5:10 - 6:50</p>
                            </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>
                        <tr>
                        <td className="hora">6:00</td>
                        <td></td>
                        
                        <td></td>
                        
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>
                        <tr>
                        <td className="hora">7:00</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <div className="right-session-student">
                    <div className="student-tutors">
                        <h2>Mis tutores</h2>
                        <div className="tutor-student">
                            <img className="profileblue" src={profileBlue} alt="profileblue" />
                            <div className="tutor-detail-student">
                                <h3>Tutor Harry Potter</h3>
                                <p>Inglés</p>
                            </div>
                        </div>
                        <div className="tutor-student">
                            <img className="profileblue" src={profileBlue} alt="profileblue" />
                            <div className="tutor-detail-student">
                                <h3>Tutor Hermione Granger</h3>
                                <p>Frances</p>
                            </div>
                        </div>
                    </div>

                    <div className="student-class-week">
                        <h2>Sesiones de esta semana</h2>
                        <div className="week-student">
                            <div className="circle-student-class"></div>
                            <div className="student-week-detail">
                                <h3>Inglés - Lun 17 de Mayo</h3>
                                <p>3:10 p.m. - 4:50 p.m.</p>
                            </div>
                        </div>
                        <div className="week-student">
                            <div className="circle-student-class"></div>
                            <div className="student-week-detail">
                                <h3>Frances - Lun 17 de Mayo</h3>
                                <p>5:10 p.m. - 6:50 p.m.</p>
                            </div>
                        </div>
                        <div className="week-student">
                            <div className="circle-student-class"></div>
                            <div className="student-week-detail">
                                <h3>Frances - Mié 19 de Mayo</h3>
                                <p>5:10 p.m. - 6:50 p.m.</p>
                            </div>
                        </div>
                        <div className="week-student">
                            <div className="circle-student-class"></div>
                            <div className="student-week-detail">
                                <h3>Inglés - Jue 20 de Mayo</h3>
                                <p>3:10 p.m. - 4:50 p.m.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

}

export default StudentSesiones