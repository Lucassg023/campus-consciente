
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Leaf,
  Menu,
  X,
  Github,
  LogIn,
  LogOut,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Painel" },
  { to: "/descarte", label: "Guia de Descarte" },
  { to: "/mural", label: "Mural de Trocas" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      setUser(error ? null : data.user);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  
const fullName =
  typeof user?.user_metadata?.["full_name"] === "string"
    ? String(user.user_metadata["full_name"]).trim()
    : "";


  const displayName = fullName || user?.email || "Minha conta";

  async function handleLogout() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setOpen(false);

      toast.success("Você saiu da sua conta.");

      await navigate({ to: "/" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível sair da conta."
      );
    } finally {
      setSigningOut(false);
    }
  }

  function AuthControls({ mobile = false }: { mobile?: boolean }) {
    if (authLoading) {
      return (
        <span className="text-sm text-muted-foreground">
          Carregando...
        </span>
      );
    }

    if (!user) {
      return (
        <Link
          to="/login"
          onClick={() => setOpen(false)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${
            mobile ? "w-full" : ""
          }`}
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </Link>
      );
    }

    return (
      <div
        className={`flex items-center gap-3 ${
          mobile ? "flex-col items-stretch" : ""
        }`}
      >
        <div
          className="flex min-w-0 items-center gap-2 text-sm"
          title={displayName}
        >
          <UserRound className="h-4 w-4 shrink-0 text-primary" />

          <span className="max-w-36 truncate font-medium">
            {displayName}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={signingOut}
          onClick={() => void handleLogout()}
          className={mobile ? "w-full" : ""}
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Saindo..." : "Sair"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-display text-lg font-bold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </span>

            <span>
              Campus
              <span className="text-primary">Consciente</span>
            </span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className: "bg-secondary text-primary",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex">
            <AuthControls />
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <nav className="container-page flex flex-col gap-1 pb-4 md:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: true }}
                className="rounded-lg px-3 py-2 text-sm font-medium"
                activeProps={{
                  className: "bg-secondary text-primary",
                }}
              >
                {n.label}
              </Link>
            ))}

            <div className="mt-3 border-t border-border pt-4">
              <AuthControls mobile />
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-secondary/50">
        <div className="container-page flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            Projeto acadêmico alinhado ao{" "}
            <strong className="text-foreground">
              ODS 12: Consumo e Produção Responsáveis
            </strong>{" "}
            da Agenda 2030 da ONU.
          </p>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Github className="h-4 w-4" />
            Repositório no GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
