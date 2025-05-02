import { createContext, useContext } from "react";

/**
 * relay.js references something like this for its error handling functions
 */
export interface ES2022Error {
  cause?: unknown;
}

export interface ErrorContextProps {
  error: ES2022Error | Error | null;
  setError: (error: ES2022Error | Error | null) => void;
}

export const ErrorContext = createContext<ErrorContextProps>({
  error: null,
  setError: () => {},
});
export const useError = () => useContext(ErrorContext);
