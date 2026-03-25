import { Badge } from "@/components/ui/badge";
import {
  getSessionBillingStatusLabel,
  type SessionBillingOperationalStatus,
} from "@/lib/session-validation";

export function SessionBillingStatusBadge({
  status,
}: {
  status: SessionBillingOperationalStatus;
}) {
  const variant =
    status === "READY_TO_BILL"
      ? "success"
      : status === "AT_RISK"
        ? "warning"
        : "danger";

  return <Badge variant={variant}>{getSessionBillingStatusLabel(status)}</Badge>;
}
