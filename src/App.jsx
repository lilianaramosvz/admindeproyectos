//frontend\src\App.jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import BacklogScreen from "./screens/BacklogScreen";
import SprintScreen from "./screens/SprintScreen";
import TasksScreen from "./screens/TasksScreen";
import KPIScreen from "./screens/KPIScreen";
import SettingsScreen from "./screens/SettingsScreen";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/backlog" element={<BacklogScreen />} />
        <Route path="/sprint" element={<SprintScreen />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/tareas" element={<TasksScreen />} />
        <Route path="/kpis" element={<KPIScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/ajustes" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
