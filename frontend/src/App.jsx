import Sidebar from "./sidebar"
import Header from "./header"
import "./App.css"

function App() {
  return (
    <div className="app">
      <Sidebar/>
      <Header/>
      <div className="main">
        <p>Contenido</p>
      </div>
    </div>
  );
}

export default App;