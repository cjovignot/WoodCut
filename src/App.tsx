import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Optimizer from "./pages/Optimizer";
import Export from "./pages/Export";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="optimizer" element={<Optimizer />} />
          <Route path="export" element={<Export />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
