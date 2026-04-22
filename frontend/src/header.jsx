import "./header.css"

function Header(){
    const date = new Date();

    const daysWeek = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 
        'Jueves', 'Viernes', 'Sábado', 'Domingo'
    ]

    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dayWeek = daysWeek[date.getDay()];
    const dayMonth = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return (
        <header className="header">
            <h1 className="fecha">
                <span className="dia-semana">{dayWeek}</span>
                {' '}{dayMonth} de {month} {year}
            </h1>
        </header>
    );
}

export default Header;