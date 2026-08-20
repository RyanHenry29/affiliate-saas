"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  ["Dashboard", "/dashboard"],
  ["Ofertas", "/offers"],
  ["Grupos", "/groups"],
  ["Mensagens", "/messaging"],
  ["Conexões", "/connections"],
  ["Automação", "/automation"],
  ["Analytics", "/analytics"],
  ["Monitoramento", "/monitoring"],
  ["Logs de Auditoria", "/logs"],
  ["Billing", "/billing"],
  ["Configurações", "/settings"],
  ["Desenvolvedor", "/developer"],
  ["Admin", "/admin"],
  ["Onboarding", "/onboarding"],
] as const;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => ITEMS.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[14vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-card shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar uma página..." className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="p-2">
          {filtered.map(([label, href], i) => (
            <button key={href} onClick={() => { setOpen(false); router.push(href); }} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent", i === 0 && "bg-accent/50")}>
              <span>{label}</span><Command className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
          {!filtered.length && <p className="p-4 text-sm text-muted-foreground">Nenhum resultado.</p>}
        </div>
        <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">Use Ctrl K para abrir a busca rápida.</div>
      </div>
    </div>
  );
}
