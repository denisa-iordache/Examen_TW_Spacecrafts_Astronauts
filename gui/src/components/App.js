import SpacecraftList from "./SpacecraftList";
import { Routes, Route, HashRouter } from "react-router-dom";
import AstronautList from "./AstronautList";
import Footer from "./Footer";
import Header from "./Header";
import "./Header.css";
import "./Footer.css";

function App() {
  return (
    <div>
      <HashRouter>
        <Header/>
        <Routes>
        <Route
            path="/"
            element={<SpacecraftList/>}
          />
          <Route
            path="/spacecrafts/:spacecraftId/astronauts"
            element={<AstronautList/>}
          />
        </Routes>
        <Footer />
      </HashRouter>
    </div>
  );
}

export default App;
