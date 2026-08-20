"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <AlertTriangle className="h-10 w-10 text-warning" />
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Algo deu errado
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "Ocorreu um erro ao carregar esta página."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
