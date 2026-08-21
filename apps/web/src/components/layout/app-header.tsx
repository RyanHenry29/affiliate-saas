"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Bell, Command, LogOut, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SubscriptionBadge } from "@/components/status-badge";

const MOBILE_NAV = [["/dashboard","Início"],["/offers","Ofertas"],["/groups","Grupos"],["/messaging","Mensagens"],["/billing","Plano"]];

const fetcher = (url: string) => api.get(url);

const NOTIFICATIONS: Array<{
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warning";
}> = [];

export function AppHeader() {
  const pathname = usePathname(); const { user, logout } = useAuth();
  const { data: me } = useSWR<any>("/auth/me", fetcher, { dedupingInterval: 60_000, errorRetryCount: 1 });
  const tenantName = me?.tenantName ?? user?.tenantName ?? "Workspace";
  const email = me?.email ?? user?.email ?? "";
  const subscriptionStatus = me?.subscription?.status ?? (me?.isAdminMaster ? "ACTIVE" : "TRIALING");

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notifOpen]);

  return <header className="sticky top-0 z-40 border-b bg-card">
    <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3"><Link href="/dashboard" className="lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Zap className="h-4 w-4" /></div></Link><div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground md:flex md:w-[300px]"><Search className="h-4 w-4" />Buscar em tudo...<kbd className="ml-auto flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]"><Command className="h-3 w-3" />K</kbd></div><div className="min-w-0 md:hidden"><p className="truncate text-sm font-semibold">{tenantName}</p></div></div>
      <div className="flex items-center gap-1.5">
        <button className="hidden rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground hover:bg-accent md:flex" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key:"k", ctrlKey:true }))}><Search className="mr-2 h-3.5 w-3.5"/>Busca rápida</button>
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" aria-label="Notificações" aria-expanded={notifOpen} onClick={() => setNotifOpen((o) => !o)} className="relative">
            <Bell className="h-4 w-4" />
            {NOTIFICATIONS.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />}
          </Button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <p className="text-sm font-semibold text-foreground">Notificações</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{NOTIFICATIONS.length}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
                  </div>
                ) : (
                  NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="hidden items-center gap-2 pl-2 sm:flex"><div className="h-8 w-8 rounded-full bg-secondary text-center text-xs font-bold leading-8">{(email?.[0] ?? "A").toUpperCase()}</div><div className="hidden xl:block"><p className="text-xs font-semibold">{tenantName}</p><SubscriptionBadge status={subscriptionStatus} /></div></div>
        <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sair" className="sm:hidden"><LogOut className="h-4 w-4" /></Button>
      </div>
    </div>
    <nav className="flex gap-1 overflow-x-auto border-t px-3 py-1.5 lg:hidden">{MOBILE_NAV.map(([href,label]) => { const active=pathname===href||pathname.startsWith(`${href}/`); return <Link key={href} href={href} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium", active?"bg-accent text-foreground":"text-muted-foreground")}>{label}</Link> })}</nav>
  </header>;
}
