"use client";

import useSWR from "swr";
import { Boxes, Database, MessageCircle, Zap } from "lucide-react";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url);

const dotCls = {
  ok: "bg-success shadow-[0_0_8px_rgba(62,207,142,.55)]",
  warn: "bg-warning shadow-[0_0_8px_rgba(232,163,61,.55)]",
  err: "bg-destructive shadow-[0_0_8px_rgba(229,72,77,.55)]",
  idle: "bg-muted-foreground/50",
};

function Row({
  icon,
  label,
  value,
  dot,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dot: keyof typeof dotCls;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dotCls[dot]}`} />
        {value}
      </span>
    </div>
  );
}

export function SystemStatus() {
  const { data: queue } = useSWR("/monitoring/queue", fetcher, {
    dedupingInterval: 30_000,
    errorRetryCount: 1,
  });
  const { data: instances } = useSWR("/messaging/instances", fetcher, {
    dedupingInterval: 30_000,
    errorRetryCount: 1,
  });

  const q = (queue as any)?.queues?.[0];
  const queueDot = q?.status === "ERROR" ? "err" : q?.status === "ACTIVE" ? "ok" : "idle";
  const queueValue = q?.status ?? "—";

  const connected = (instances as any[])?.filter((i) => i.status === "CONNECTED").length ?? 0;
  const total = (instances as any[])?.length ?? 0;

  return (
    <div className="rounded-lg border bg-background/50 px-1 py-1.5">
      <Row icon={<Zap className="h-3.5 w-3.5" />} label="API" value={queue ? "Online" : "—"} dot={queue ? "ok" : "idle"} />
      <Row icon={<Boxes className="h-3.5 w-3.5" />} label="Fila de disparos" value={queueValue} dot={queueDot} />
      <Row icon={<MessageCircle className="h-3.5 w-3.5" />} label="Instâncias" value={`${connected}/${total}`} dot={connected > 0 ? "ok" : "idle"} />
      <Row icon={<Database className="h-3.5 w-3.5" />} label="Banco de dados" value={queue ? "Online" : "—"} dot={queue ? "ok" : "idle"} />
    </div>
  );
}