import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      alert(data.message);
      navigate("/verify-reset", { state: { email } });
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2>🔐 Réinitialisation du mot de passe</h2>
      <form onSubmit={handleSendCode}>
        <label>Email :</label>
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Envoi en cours..." : "Envoyer le code"}
        </button>
      </form>
    </div>
  );
}
