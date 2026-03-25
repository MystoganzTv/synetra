import { Badge } from "@/components/ui/badge";
import {
  getSessionValidationStatusLabel,
  type SessionValidationStatus,
} from "@/lib/session-validation";

export function SessionValidationStatusBadge({
  status,
}: {
  status: SessionValidationStatus;
}) {
  const variant =
    status === "valid"
      ? "success"
      : status === "warning"
        ? "warning"
        : "danger";

  return <Badge variant={variant}>{getSessionValidationStatusLabel(status)}</Badge>;
}
