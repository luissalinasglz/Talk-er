import "./header.css"

function Header(){
    const fecha = new Date();

    const diasSemana = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 
        'Jueves', 'Viernes', 'Sábado', 'Domingo'
    ]

    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const diaSemana = diasSemana[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return (
        <header className="header">
            <h1 className="fecha">
                <span className="dia-semana">{diaSemana}</span>
                {' '}{diaMes} de {mes} {anio}
            </h1>
        </header>
    );
}

export default Header;