//frontend\src\App.jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import BacklogScreen from "./screens/BacklogScreen";
import SprintScreen from "./screens/SprintScreen";
import TasksScreen from "./screens/TasksScreen";
import KPIScreen from "./screens/KPIScreen";
import SettingsScreen from "./screens/SettingsScreen";
import LoginScreen from "./screens/LoginScreen";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./context/ProtectedRoute";
import { MensajeManager } from "./components/messageKafka/MensajeManager";
import AsistenteIAScreen from "./screens/AsistenteIAScreen";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

function AppLayout({ children }) {
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MensajeManager />
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/backlog"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BacklogScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sprint"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SprintScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TasksScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tareas"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TasksScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kpis"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <KPIScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajustes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/asistencia-ia"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AsistenteIAScreen />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
