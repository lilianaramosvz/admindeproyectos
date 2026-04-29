//frontend\src\screens\SettingsScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/screens/SettingsScreen.module.css";

export default function SettingsScreen() {
  const { user } = useAuth();

  if (!user) return null;

  const fields = [
    {
      label: "Nombre completo",
      value: `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim(),
    },
    {
      label: "Correo electrónico",
      value: user.correo ?? "—",
    },

    {
      label: "ID de equipo",
      value: user.idEquipo ? `Equipo ${user.idEquipo}` : "—",
    },
    {
      label: "ID de usuario",
      value: user.idUsuario ?? "—",
    },
  ];

  return (
    <MainLayout title="Ajustes">
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.title}>Ajustes</h1>
          <p className={styles.headerDescription}>
            Información de tu cuenta registrada en el sistema.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Información de la cuenta</h2>

          {fields.map((field, index) => (
            <div
              key={field.label}
              className={`${styles.item} ${
                index < fields.length - 1 ? styles.withDivider : ""
              }`}
            >
              <div className={styles.block}>
                <div className={styles.row}>
                  <div>
                    <p className={styles.label}>{field.label}</p>
                    <p className={styles.value}>{field.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
