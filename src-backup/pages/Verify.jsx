import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/verify.css";

const Verify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Email verified successfully!");
        navigate("/login"); // بعد التحقق ننتقل لصفحة الدخول
      } else {
        alert(data.message || "❌ Invalid or expired code");
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      alert("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Email Verification</h2>
        <p>Enter your email and the code sent to your inbox.</p>

        <form onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/register")}>
          ← Back to Register
        </button>
      </div>
    </div>
  );
};

export default Verify;
