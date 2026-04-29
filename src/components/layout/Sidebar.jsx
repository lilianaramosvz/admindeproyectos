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
  { label: "Información", to: "/ajustes" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const initials = user
    ? `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase()
    : "??";

  // Mostrar solo el primer nombre y el primer apellido
  const fullName = user
    ? `${user.nombre?.split(" ")?.[0] ?? ""} ${user.apellido?.split(" ")?.[0] ?? ""}`.trim()
    : "Usuario";

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
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userText}>
              <span className={styles.name}>{fullName}</span>
              <span className={styles.email}>{user?.correo ?? ""}</span>
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
