import { Alert } from "@mui/material";
import { en } from "../../text/en";

export interface FeedbackMessage {
  readonly tone: "success" | "error";
  readonly message: string;
}

interface FeedbackProps {
  readonly feedback: FeedbackMessage | null;
}

/** The one polite live region for every message; it is always present so assistive technology hears changes. */
export function Feedback({ feedback }: FeedbackProps) {
  return (
    <div role="status" aria-live="polite" aria-label={en.messages}>
      {feedback && (
        <Alert severity={feedback.tone} role="presentation">
          {feedback.message}
        </Alert>
      )}
    </div>
  );
}
