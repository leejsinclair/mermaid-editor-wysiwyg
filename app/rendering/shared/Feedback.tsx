import { Alert } from "@mui/material";
import { en } from "../../text/en";

export interface FeedbackMessage {
  readonly tone: "success" | "error" | "warning";
  readonly message: string;
}

/** The message to show: the one given, or, when the appearance could not be kept for the next visit, that notice (spec 007, FR-026). */
export function withAppearanceNotice(feedback: FeedbackMessage | null, kept: boolean): FeedbackMessage | null {
  if (feedback !== null || kept) return feedback;
  return { tone: "warning", message: en.appearance.notSaved };
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
