import "./tutor-dashboard.css";

function Dashboard() {
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

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="left-rectangles">
          
          <div className="rectangle class-orden">
            <h3>Mis clases</h3>
            
            <div className="content">
              <div className="info">
                <div className="circle"></div>
                <div className="side">
                  <p>Inglés A</p>
                  <p className="groups">Lunes y Jueves 3:10 p.m. - 4:50 p.m.</p>
                </div>
              </div>
              
              <div className="line-separate"></div>
              
              <div className="info">
                <div className="circle"></div>
                <div className="side">
                  <p>Inglés B</p>
                  <p className="groups">Lunes y Miércoles 5:10 p.m. 6:50 p.m.</p>
                </div>
              </div>
            
            </div> 
          </div>
          
          <div className="rectangle">
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
                      <p>Inglés A</p> 
                      <p>3:10 - 4:50</p>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td rowspan={2}>
                    <div className="evento">
                      <p>Inglés A</p> 
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
                      <p>Inglés B</p> 
                      <p>5:10 - 6:50</p>
                    </div>
                  </td>
                  <td></td>
                  <td rowspan={2}>
                    <div className="evento">
                      <p>Inglés B</p> 
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
        </div>
        
        <div className="right-rectangles">
          
          <div className="rectangle acreditadas">
            <h5>Horas acreditadas</h5>
            <div className="content">
              <p className="count">90/180 hrs</p>
              <div className="content-bar">
                <div className="percentage-bar">
                </div>
              </div>
              <div className="percentage">
                <p>50% Completado</p>
                <p>Faltan 90hrs</p>
              </div>
            </div>
          </div>
          
          <div className="rectangle grow">
            <h3>Por Calificar</h3>
            <div className="content">
              <div className="lessons">
                <div className="circle"></div>
                <div className="side">
                  <p>Lección del verbo to be</p>
                <p className="groups">Inglés A</p>
                </div>
              </div>
              <div className="lessons">
                <div className="circle"></div>
                <div className="side">
                  <p>Examen de vocabulario</p>
                  <p className="groups">Inglés B</p>
                </div>
              </div>
              <div className="lessons">
                <div className="circle"></div>
                <div className="side">
                  <p>Lección del pasado simple</p>
                  <p className="groups">Inglés B</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;