//frontend\src\components\layout\MainLayout.jsx
import Sidebar from "./Sidebar";
import styles from "../../styles/components/layout/MainLayout.module.css";

export default function MainLayout({ children, title = "Dashboard" }) {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.main}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
