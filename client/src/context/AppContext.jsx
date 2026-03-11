import { createContext, useContext, useState } from "react";

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

export function AppProvider({ children }) {
  const [studentContext, setStudentContext] = useState(initialStudentContext);
  const [latestPrompt, setLatestPrompt] = useState("");
  const [matchedGrants, setMatchedGrants] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [savedScans, setSavedScans] = useState([]);
  const [requestState, setRequestState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const saveScan = (prompt, grants) => {
    if (!prompt || !grants.length) {
      return;
    }

    const nextScan = buildSavedScan(prompt, grants);
    setSavedScans((current) => [nextScan, ...current].slice(0, 6));
  };

  const value = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
