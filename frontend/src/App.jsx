import {BrowserRouter, Routes, Route} from "react-router-dom"
import Sidebar from "./sidebar"
import Header from "./header"
import "./App.css"
import Dashboard from "./pages/dashboard"
import Sesiones from "./pages/sesiones"
import Ligas from "./pages/ligas"
import Tareas from "./pages/tareas"
import Examenes from "./pages/examenes"
import Material from "./pages/material"
import Anuncios from "./pages/anuncios"
import Bitacoras from "./pages/bitacoras"
import Horas from "./pages/horas"

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar/>
        <Header/>
        <div className="main">
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/sesiones" element={<Sesiones/>}/>
            <Route path="/ligas" element={<Ligas />}/>
            <Route path="/tareas" element={<Tareas />}/>
            <Route path="/examenes" element={<Examenes />}/>
            <Route path="/material" element={<Material />}/>
            <Route path="/anuncios" element={<Anuncios />}/>
            <Route path="/bitacora" element={<Bitacoras />}/>
            <Route path="/horas" element={<Horas />}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;