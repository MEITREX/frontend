import { Alert } from "@mui/material";

/**
 * relay.js references something like this for its error handling functions
 */
export interface ES2022Error {
  cause?: unknown;
}

type Props = {
  error: ES2022Error | null;
  onClose?: () => void;
};

export function FormErrors({ error, onClose }: Props) {
  if (!error) return null;

  return (
    <div className="flex flex-col gap-2 mt-8">
      {/* this seems to be the actual error type structure: */}
      {(error.cause as { errors: { message: string }[] })?.errors.map(
        (err, i: number) => (
          <Alert key={i} severity="error" onClose={onClose}>
            {err?.message}
          </Alert>
        )
      )}
    </div>
  );
}
