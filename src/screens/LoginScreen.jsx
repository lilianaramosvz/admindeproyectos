//frontend\src\screens\LoginScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/screens/LoginScreen.module.css";
import { Lock, Mail } from "lucide-react";

const LoginScreen = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Aquí irá la llamada al endpoint del backend
      // Por ahora simulamos un delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Validación básica temporal
      if (!email || !password) {
        setError("Por favor completa todos los campos");
        setLoading(false);
        return;
      }

      login();
      navigate("/dashboard");
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
        {/* Ícono de Candado */}
        <div className={styles.iconContainer}>
          <Lock size={32} />
        </div>

        {/* Encabezado */}
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Inicia sesión en tu dashboard</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className={styles.form}>
          {/* Input de Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* Input de Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Botón de Envío */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Pie de Página */}
        <p className={styles.footer}>
          Demostración: Usa cualquier correo y contraseña para continuar
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
