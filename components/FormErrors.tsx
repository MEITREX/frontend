import { Alert } from "@mui/material";
import { ES2022Error } from "./ErrorContext";

type Props = {
  error: ES2022Error | Error | null;
  onClose?: () => void;
};

export function FormErrors({ error, onClose }: Props) {
  if (!error) return null;
  console.error("💥", error);

  return (
    <div className="flex flex-col gap-2 mt-8">
      {"message" in error ? (
        <Alert severity="error" onClose={onClose}>
          {error.message}
        </Alert>
      ) : (
        // this seems to be the actual error type structure:
        (error.cause as { errors: { message: string }[] })?.errors.map(
          (err, i: number) => (
            <Alert key={i} severity="error" onClose={onClose}>
              {err?.message}
            </Alert>
          )
        )
      )}
    </div>
  );
}
