//frontend\src\screens\LoginScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import styles from "../styles/screens/LoginScreen.module.css";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

const LoginScreen = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(correo, password);
      login(data.token, {
        correo: data.correo,
        nombre: data.nombre,
        apellido: data.apellido,
        idUsuario: data.idUsuario,
        idRol: data.idRol,
        idEquipo: data.idEquipo,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
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
          {/* Correo */}
          <div className={styles.inputGroup}>
            <label htmlFor="correo" className={styles.label}>
              Correo Electrónico
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePasswordButton}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
      </div>
    </div>
  );
};

export default LoginScreen;
