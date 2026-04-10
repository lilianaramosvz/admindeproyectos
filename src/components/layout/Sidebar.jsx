//frontend\src\components\layout\Sidebar.jsx
import styles from "../../styles/components/layout/Sidebar.module.css";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Backlog", to: "/backlog" },
  { label: "Sprint", to: "/sprint" },
  { label: "Tareas", to: "/tareas" },
  { label: "KPI's", to: "/kpis" },
  { label: "Ajustes", to: "/ajustes" },
];

export default function Sidebar() {
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
          <div className={styles.avatar}></div>
          <div className={styles.userInfo}>
            {/* Ejemplo para el display, esto se deberá cambiar a los valores reales del usuario */}
            <span className={styles.name}>Lili Ramos</span>
            <span className={styles.email}>lili.ramos@example.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
