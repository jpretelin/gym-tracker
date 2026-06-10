import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const register = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050805",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#0b120c",
          border: "1px solid #16351c",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ color: "#22c55e", textAlign: "center" }}>
          GYMTRACK
        </h1>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid #16351c",
            background: "#050805",
            color: "white",
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #16351c",
            background: "#050805",
            color: "white",
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#22c55e",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          Iniciar Sesión
        </button>

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "transparent",
            border: "1px solid #22c55e",
            color: "#22c55e",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Crear Cuenta
        </button>
      </div>
    </div>
  );
}