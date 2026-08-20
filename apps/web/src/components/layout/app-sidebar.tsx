"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Activity, Bot, CreditCard, Gauge, LayoutDashboard, LogOut, MessageCircle, Menu, ScrollText, Settings, ShieldCheck, Tags, Terminal, Users, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SystemStatus } from "./system-status";

const fetcher = (url: string) => api.get(url);

type NavItem = [string, string, React.ComponentType<{ className?: string }>];
type NavGroup = { title: string; items: NavItem[] };

const BASE_GROUPS: NavGroup[] = [
  { title: "Operação", items: [
    ["/dashboard", "Operação", LayoutDashboard], ["/offers", "Ofertas", Tags], ["/groups", "Grupos", Users], ["/messaging", "Mensageria", MessageCircle],
  ]},
  { title: "Automação", items: [
    ["/automation", "Automações", Bot], ["/analytics", "Analytics", Gauge], ["/monitoring", "Monitoramento", Activity], ["/logs", "Logs", ScrollText],
  ]},
  { title: "Conta", items: [
    ["/billing", "Assinatura", CreditCard], ["/connections", "Conexões", Zap], ["/developer", "Desenvolvedor", Terminal], ["/settings", "Configurações", Settings],
  ]},
];

function SidebarContent({ pathname, user, isAdmin, logout, onNavigate }: {
  pathname: string;
  user: any;
  isAdmin: boolean;
  logout: () => void;
  onNavigate?: () => void;
}) {
  const groups = isAdmin
    ? [...BASE_GROUPS, { title: "Sistema", items: [["/admin", "Administração", ShieldCheck] as NavItem] }]
    : BASE_GROUPS;

  return (
    <>
      <Link href="/dashboard" onClick={onNavigate} className="group flex h-16 items-center gap-3 border-b px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Zap className="h-4 w-4" /></div>
        <div><div className="text-sm font-bold tracking-tight">Affiliate<span className="text-primary">OS</span></div><div className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">Automation Cloud</div></div>
      </Link>
      <div className="border-b p-3"><SystemStatus /></div>
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => <div key={group.title}><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{group.title}</p><div className="space-y-1">{group.items.map(([href,label,Icon]) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} onClick={onNavigate} className={cn("group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", active ? "bg-primary/10 text-primary ring-1 ring-primary/15" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="h-4 w-4 shrink-0" />{label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}</Link>; })}</div></div>)}
      </nav>
      <div className="border-t p-3"><div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">{(user?.email?.[0] ?? "A").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.tenantName ?? "Workspace"}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email ?? ""}</p></div></div><Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { void logout(); onNavigate?.(); }}><LogOut className="mr-2 h-4 w-4" />Sair</Button></div>
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: me } = useSWR("/auth/me", fetcher, {
    dedupingInterval: 60_000,
    errorRetryCount: 1,
  });
  const isAdmin = (me as any)?.isAdminMaster === true;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[248px] shrink-0 flex-col border-r bg-card lg:flex">
        <SidebarContent pathname={pathname} user={user} isAdmin={isAdmin} logout={logout} />
      </aside>

      {/* Mobile sidebar trigger */}
      <button
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r bg-card shadow-2xl lg:hidden">
            <div className="absolute right-3 top-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              user={user}
              isAdmin={isAdmin}
              logout={logout}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
