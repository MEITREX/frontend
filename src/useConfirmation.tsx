import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

// Define the shape of the options our confirm function will take.
interface ConfirmOptions {
  title: string;
  message: string;
}

// 1. Create the Context
// This creates a "channel" for other components to communicate with our provider.
const ConfirmationContext = createContext((options: ConfirmOptions) =>
  Promise.resolve(false)
);

// 2. Create the Provider
// This component will wrap our app. It holds the state and logic.
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  // This will hold the `resolve` function of the promise we create.
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => {});

  // This is the function that components will call.
  const confirm = useCallback((options: ConfirmOptions) => {
    // We return a promise that will resolve when the user clicks a button.
    return new Promise<boolean>((resolve) => {
      setOptions(options); // Set the title and message
      setResolve(() => resolve); // Store the promise's resolve function
    });
  }, []);

  const handleClose = () => {
    setOptions(null);
  };

  const handleConfirm = () => {
    resolve(true); // Resolve the promise with `true`
    handleClose();
  };

  const handleCancel = () => {
    resolve(false); // Resolve the promise with `false`
    handleClose();
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {/* The actual dialog component is rendered here */}
      <ConfirmationDialog
        open={options !== null}
        title={options?.title ?? ""}
        message={options?.message ?? ""}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  return useContext(ConfirmationContext);
}
