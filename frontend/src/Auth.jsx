import { useState } from "react";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    const url = isLogin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("name", data.name);
          onLogin(data.name);
        } else {
          setMessage("Account created! Please login.");
          setIsLogin(true);
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Connection error!");
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        {!isLogin && (
          <input
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        {message && <p className="auth-message">{message}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>

        <p className="auth-switch">
          {isLogin ? "No account?" : "Already have account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;