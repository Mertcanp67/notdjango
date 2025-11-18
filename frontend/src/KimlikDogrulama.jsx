import React, { useState, useEffect, useRef } from 'react';

export function Auth({ onLogin, onRegister, loading, error, setError }) {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    password2: "",
    email: "",
  });

  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);
  const [authContainerHeight, setAuthContainerHeight] = useState('auto');

  useEffect(() => {
    if (authMode === 'login' && loginFormRef.current) {
      setAuthContainerHeight(loginFormRef.current.scrollHeight + 50);
    } else if (authMode === 'register' && registerFormRef.current) {
      setAuthContainerHeight(registerFormRef.current.scrollHeight + 50);
    }
  }, [authMode]);

  const handleLoginClick = () => {
    onLogin(authForm.username, authForm.password);
  };

  const handleRegisterClick = () => {
    onRegister(authForm.username, authForm.password, authForm.password2, authForm.email);
  };

  return (
    <div className="container" style={{ textAlign: "center", marginTop: 120 }}>
      <h1>🧑‍💻 Özel Not Uygulaması</h1>
      <p className="footer-muted">
        {authMode === "login"
          ? "Giriş yapmak için kullanıcı adı/e-posta ve şifrenizi girin."
          : "Kayıt olmak için kullanıcı adı, email ve şifre oluşturun."}
      </p>

      <div
        className="card auth-container"
        style={{
          maxWidth: 420,
          margin: "20px auto",
          height: authContainerHeight,
          opacity: loading ? 0.5 : 1,
          padding: '25px 0'
        }}
      >
        <div className={`auth-forms-slider ${authMode === 'register' ? 'show-register' : ''}`}>
          {/* --- GİRİŞ FORMU --- */}
          <div className="auth-form" ref={loginFormRef}>
            <input
              className="input"
              placeholder="Kullanıcı adı veya Email"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder="Şifre"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <button className="btn primary" onClick={handleLoginClick} disabled={loading}>
              Giriş Yap
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setAuthMode("register");
                setError("");
                setAuthForm({ username: "", password: "", password2: "", email: "" });
              }}
            >
              Hesabın yok mu? Kayıt ol
            </button>
          </div>

          {/* --- KAYIT FORMU --- */}
          <div className="auth-form" ref={registerFormRef}>
            <input
              className="input"
              placeholder="Kullanıcı adı"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input
              className="input"
              type="email"
              placeholder="Email Adresi"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder="Şifre"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <input
              className="input"
              type="password"
              placeholder="Şifre Tekrar"
              value={authForm.password2}
              onChange={(e) => setAuthForm({ ...authForm, password2: e.target.value })}
            />
            <button className="btn primary" onClick={handleRegisterClick} disabled={loading}>
              Kayıt Ol
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError("");
                setAuthForm({ username: "", password: "", password2: "", email: "" });
              }}
            >
              Hesabın var mı? Giriş yap
            </button>
          </div>
        </div>

        {loading && <p className="footer-muted" style={{ padding: '0 25px' }}>Yükleniyor…</p>}
        {error && (
          <p className="footer-muted" style={{ color: "#ffb3b3", padding: '0 25px' }}>
            Hata: {error}
          </p>
        )}
      </div>
    </div>
  );
}