import React from 'react';

export function Header({ currentUser, onLogout, theme, onToggleTheme, isAdmin }) {
  return (
    <div className="header">
      <div className="logo">🗒️</div>
      <h1 className="h1">Özel Not Defteri</h1>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {isAdmin && (
          <span style={{ color: 'var(--danger)', fontWeight: 'bold', border: '1px solid var(--danger)', padding: '4px 8px', borderRadius: '6px' }}>
            🛡️ Admin Paneli
          </span>
        )}
        <span style={{ color: "#8fa3bf" }}>👤 {currentUser}</span>
        <button className="btn ghost" onClick={onToggleTheme} style={{ padding: '8px 12px' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="btn ghost" onClick={onLogout}>
          Çıkış
        </button>
      </div>
    </div>
  );
}