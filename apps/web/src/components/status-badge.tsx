import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { InstanceStatus } from "@/lib/types";

type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

const SUB_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada",
  TRIALING: "Teste",
};

const SUB_CLASSES: Record<SubscriptionStatus, string> = {
  ACTIVE: "border-success/40 bg-success/10 text-success",
  PAST_DUE: "border-warning/40 bg-warning/10 text-warning",
  CANCELED: "border-destructive/40 bg-destructive/10 text-destructive",
  TRIALING: "border-primary/40 bg-primary/10 text-primary",
};

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant="outline" className={cn("px-2 py-0.5", SUB_CLASSES[status])}>
      {SUB_LABELS[status]}
    </Badge>
  );
}

const INSTANCE_LABELS: Record<InstanceStatus, string> = {
  CONNECTED: "Conectada",
  CONNECTING: "Conectando",
  DISCONNECTED: "Desconectada",
  FAILED: "Falha",
};

const INSTANCE_CLASSES: Record<InstanceStatus, string> = {
  CONNECTED: "border-success/40 bg-success/10 text-success",
  CONNECTING: "border-warning/40 bg-warning/10 text-warning",
  DISCONNECTED: "border-destructive/40 bg-destructive/10 text-destructive",
  FAILED: "border-destructive/40 bg-destructive/10 text-destructive",
};

const INSTANCE_DOT: Record<InstanceStatus, string> = {
  CONNECTED: "bg-success",
  CONNECTING: "bg-warning",
  DISCONNECTED: "bg-destructive",
  FAILED: "bg-destructive",
};

export function InstanceBadge({
  status,
  className,
}: {
  status: InstanceStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2 py-0.5",
        INSTANCE_CLASSES[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          INSTANCE_DOT[status],
        )}
      />
      {INSTANCE_LABELS[status]}
    </Badge>
  );
}
