//frontend\src\screens\SettingsScreen.jsx
import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import styles from "../styles/screens/SettingsScreen.module.css";

export default function SettingsScreen() {
  const [user, setUser] = useState({
    email: "lili.ramos@example.com",
    role: "Senior Developer",
    team: "Equipo 44",
  });

  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (field) => {
    setEditField(field);
    setTempValue(user[field]);
  };

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      [editField]: tempValue,
    }));
    setEditField(null);
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue("");
  };

  const fields = [
    { key: "email", label: "Correo", editable: false },
    { key: "role", label: "Rol", editable: true },
    { key: "team", label: "Equipo", editable: true },
  ];

  return (
    <MainLayout title="Ajustes">
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.title}>Ajustes</h1>
          <p style={{ paddingTop: "12px" }}>Maneja y administra tu cuenta.</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Información de la cuenta</h2>

          {fields.map((field, index) => (
            <div
              key={field.key}
              className={`${styles.item} ${index < fields.length - 1 ? styles.withDivider : ""}`}
            >
              <div className={styles.block}>
                <div className={styles.row}>
                  <div>
                    <p className={styles.label}>{field.label}</p>
                    <p className={styles.value}>{user[field.key]}</p>
                  </div>

                  <button
                    className={styles.edit}
                    onClick={() => handleEdit(field.key)}
                    style={{ visibility: field.editable ? "visible" : "hidden" }}
                  >
                    Editar
                  </button>
                </div>

                {editField === field.key && (
                  <div className={styles.dropdown}>
                    <input
                      className={styles.inputInline}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                    />

                    <div className={styles.actions}>
                      <button className={styles.save} onClick={handleSave}>
                        Guardar
                      </button>
                      <button className={styles.cancel} onClick={handleCancel}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
