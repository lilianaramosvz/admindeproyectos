//frontend\src\components\message\MensajeManager.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  conectarWebSocket,
  desconectarWebSocket,
} from "../../services/websocket";
import styles from "../../styles/components/message/MensajeManager.module.css";

function Banner({ id, tipo, texto, onClose }) {
  const isAlerta = tipo === "alerta";
  const bannerClassName = `${styles.banner} ${
    isAlerta ? styles.alerta : styles.recordatorio
  }`;

  return (
    <div className={bannerClassName}>
      {/* Barra de color lateral */}
      <div className={styles.barraLateral} />

      {/* Título */}
      <p className={styles.titulo}>
        {isAlerta ? "Mensaje del administrador URGENTE" : "Recordatorio"}
      </p>

      {/* Texto del mensaje */}
      <p className={styles.texto}>{texto}</p>

      {/* Botón cerrar */}
      <button onClick={() => onClose(id)} className={styles.botonCerrar}>
        ✕
      </button>
    </div>
  );
}

// Contenedor principal
export function MensajeManager() {
  const [mensajes, setMensajes] = useState([]);
  const idRef = useRef(0);

  const agregar = useCallback((data, tipo) => {
    const texto =
      data?.texto ||
      data?.mensaje ||
      data?.content ||
      data?.message ||
      data?.body ||
      JSON.stringify(data);

    setMensajes((prev) =>
      [{ id: ++idRef.current, tipo, texto }, ...prev].slice(0, 10),
    ); // máximo 10 a la vez
  }, []);

  const cerrar = useCallback((id) => {
    setMensajes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    conectarWebSocket({
      onAlerta: (data) => agregar(data, "alerta"),
      onRecordatorio: (data) => agregar(data, "recordatorio"),
    });
    return () => desconectarWebSocket();
  }, [agregar]);

  return (
    <div className={styles.contenedorMensajes}>
      {mensajes.map((m) => (
        <div key={m.id} className={styles.itemMensaje}>
          <Banner {...m} onClose={cerrar} />
        </div>
      ))}
    </div>
  );
}
