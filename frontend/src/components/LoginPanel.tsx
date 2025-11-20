import React, { useState } from "react";
import { LogOut, User } from "lucide-react";

interface LoginPanelProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({
  isLoggedIn = false,
  userName = "Użytkownik",
  onLogout = () => {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempUserName, setTempUserName] = useState("");

  const handleLogin = () => {
    if (email && password) {
      fetch("api/firebase/login/", {
        method: "POST",
        body: JSON.stringify({ email, passwd: password })})
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setTempUserName(data.displayName)
            setShowLoginForm(false);
            setEmail("");
            setPassword("");
            setShowDropdown(false);
          } else {
            alert("Błąd logowania. Spróbuj ponownie.");
          }
        })
      }
    };

  if (isLoggedIn || tempUserName) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/15 focus:outline-none"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{tempUserName || userName}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-black/80 backdrop-blur shadow-lg z-50">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Zalogowany jako</p>
              <p className="text-sm font-semibold text-white">
                {tempUserName || userName}
              </p>
            </div>
            <button
              onClick={() => {
                setTempUserName("");
                onLogout();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
            </button>
          </div>
        )}
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-6">
          <h2 className="text-lg font-bold text-white mb-5">Zaloguj się</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twój@email.com"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLoginForm(false)}
                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 hover:border-white/40 hover:bg-white/15 hover:text-white transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 rounded-xl border border-emerald-400/50 bg-emerald-400/20 px-4 py-3 text-sm font-medium text-emerald-50 hover:border-emerald-400/70 hover:bg-emerald-400/30 transition-all"
              >
                Zaloguj
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowLoginForm(true)}
      className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/15 focus:outline-none"
    >
      <User className="h-4 w-4" />
      Zaloguj się
    </button>
  );
};
