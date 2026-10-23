import React, { createContext, useCallback, useContext, useState } from "react";

// ── Storage keys ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "verix_token";
const USER_KEY  = "verix_user";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Safely read the persisted JWT from localStorage.
 * Returns null if absent or empty.
 */
function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Safely parse the persisted user object from localStorage.
 * Returns null on any parse error or absent entry — never crashes.
 */
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Accept only objects with a string id field — guards against garbage data.
    if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

/**
 * AuthProvider — wrap the entire app with this at the root.
 *
 * Provides:
 *   token      : string | null
 *   user       : { id, name, email, createdAt } | null
 *   isLoggedIn : boolean
 *   login(token, user)  — persist to localStorage and update state
 *   logout()            — clear localStorage and reset state
 */
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so a page refresh keeps the user logged in.
  const [token, setToken] = useState(() => readStoredToken());
  const [user,  setUser]  = useState(() => readStoredUser());

  /**
   * Called after a successful login or registration.
   * Stores the token and safe user object; never stores the password.
   *
   * Wrapped in useCallback with an empty dep array so the function reference
   * is stable across re-renders. This prevents useEffect hooks that list
   * `login` as a dependency from firing repeatedly.
   */
  const login = useCallback((newToken, newUser) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch {
      // localStorage may be unavailable in some restricted environments.
      // The session will still work from in-memory state until the page refreshes.
    }
    setToken(newToken);
    setUser(newUser);
  }, []); // setToken/setUser are stable React dispatch refs — no deps needed

  /**
   * Called on logout or when a 401 indicates the token is invalid/expired.
   * Clears both localStorage entries and resets in-memory state.
   *
   * Wrapped in useCallback with an empty dep array so the function reference
   * is stable. HistoryPage and Upload list `logout` in useEffect dep arrays;
   * without this, every render would produce a new `logout` reference and
   * re-trigger those effects.
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore — state will still be reset below.
    }
    setToken(null);
    setUser(null);
  }, []); // setToken/setUser are stable React dispatch refs — no deps needed

  const value = {
    token,
    user,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Throws if used outside of AuthProvider (programming error).
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};

export default AuthContext;
