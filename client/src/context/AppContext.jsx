import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "scavenger_auth";

const initialStudentContext = {
  major: "Undeclared",
  role: "Individual Advocate",
};

const AppContext = createContext(null);

function buildSavedScan(prompt, grants) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: prompt.length > 42 ? `${prompt.slice(0, 42)}...` : prompt,
    prompt,
    grants,
    savedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
}

function loadAuthState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: "", userProfile: null };
    }
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || "",
      userProfile: parsed.userProfile || null,
    };
  } catch {
    return { token: "", userProfile: null };
  }
}

export function AppProvider({ children }) {
  const authState = loadAuthState();
  const [authToken, setAuthToken] = useState(authState.token);
  const [userProfile, setUserProfile] = useState(authState.userProfile);
  const [studentContext, setStudentContext] = useState(initialStudentContext);
  const [latestPrompt, setLatestPrompt] = useState("");
  const [matchedGrants, setMatchedGrants] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [savedScans, setSavedScans] = useState([]);
  const [requestState, setRequestState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const saveAuth = (token, profile) => {
    setAuthToken(token);
    setUserProfile(profile);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        userProfile: profile,
      }),
    );
  };

  const logout = () => {
    setAuthToken("");
    setUserProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveScan = (prompt, grants) => {
    if (!prompt || !grants.length) {
      return;
    }

    const nextScan = buildSavedScan(prompt, grants);
    setSavedScans((current) => [nextScan, ...current].slice(0, 6));
  };

  const value = useMemo(
    () => ({
      authToken,
      userProfile,
      isAuthenticated: Boolean(authToken && userProfile),
      saveAuth,
      logout,
      studentContext,
      setStudentContext,
      latestPrompt,
      setLatestPrompt,
      matchedGrants,
      setMatchedGrants,
      selectedGrant,
      setSelectedGrant,
      savedScans,
      saveScan,
      requestState,
      setRequestState,
      errorMessage,
      setErrorMessage,
    }),
    [authToken, userProfile, studentContext, latestPrompt, matchedGrants, selectedGrant, savedScans, requestState, errorMessage],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
