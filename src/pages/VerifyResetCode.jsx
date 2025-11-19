import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyResetCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      alert("✅ Mot de passe mis à jour !");
      navigate("/login");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="verify-container">
      <h2>Vérification du code</h2>
      <form onSubmit={handleVerify}>
        <p>Email : <b>{email}</b></p>
        <label>Code reçu :</label>
        <input
          type="text"
          placeholder="Entrez le code OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <label>Nouveau mot de passe :</label>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Valider</button>
      </form>
    </div>
  );
}
