import Header from "../../header.jsx";

function Dashboard() {
    return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <div className="left-rectangles">
          <div className="rectangle-one">
            <h3>Mis clases</h3>
            <p>Dashboard de supervisor</p>
          </div>
          <div className="rectangle-two">
            <h3>Semana ()</h3>
          </div>
        </div>

        <div className="right-rectangles">
          <div className="rectangle-three">
            <h5>Horas acreditadas</h5>
          </div>
          <div className="rectangle-four">
            <h3>Por Calificar</h3>
          </div>
        </div>
      </div>
    </div>
    );

}

export default Dashboard
