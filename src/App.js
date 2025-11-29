import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Prevision24h from "./pages/Prevision24h";
import AnalyseHistorique from "./pages/AnalyseHistorique";
import PerformanceModeles from "./pages/PerformanceModeles";
import Parametres from "./pages/Parametres";
import Profil from "./pages/Profil";
import Login from "./pages/Login";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="login" element ={<Login/>}/>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="prevision" element={<Prevision24h />} />
                    <Route path="analyse" element={<AnalyseHistorique />} />
                    <Route path="performance" element={<PerformanceModeles />} />
                    <Route path="parametres" element={<Parametres />} />
                    <Route path="profil" element={<Profil />} />
                </Route>
            </Routes>
        </Router>
    );
}