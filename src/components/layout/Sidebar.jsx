//frontend\src\components\layout\Sidebar.jsx
import styles from "../../styles/components/layout/Sidebar.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Backlog", to: "/backlog" },
  { label: "Sprint", to: "/sprint" },
  { label: "Tareas", to: "/tareas" },
  { label: "KPI's", to: "/kpis" },
  { label: "Asistencia IA", to: "/asistencia-ia" },
  { label: "Ajustes", to: "/ajustes" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={styles.sidebar} aria-label="Sidebar navigation">
      <div className={styles.brandBlock}>
        <div className={styles.brandLabel}>Administración de</div>
        <div className={styles.brandName}>Proyectos</div>
        <hr className={styles.separator} />
      </div>

      <nav>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.profileSection}>
        <hr className={styles.separator} />
        <div className={styles.profileRow}>
          <div className={styles.avatar}>LR</div>
          <div className={styles.userInfo}>
            <div className={styles.userText}>
              {/* Ejemplo para el display, esto se deberá cambiar a los valores reales del usuario */}
              <span className={styles.name}>Lili Ramos</span>
              <span className={styles.email}>lili.ramos@example.com</span>
            </div>
            <button
              type="button"
              className={styles.logoutLink}
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
