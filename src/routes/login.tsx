
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Conta criada com sucesso!");
          await navigate({ to: "/mural" });
        } else {
          toast.success(
            "Cadastro recebido! Verifique seu e-mail para confirmar a conta."
          );
          setIsRegister(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error("Não foi possível verificar o usuário autenticado.");
}

toast.success("Login realizado com sucesso!");
await navigate({ to: "/mural" });
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h1 className="font-display text-3xl font-bold">
            {isRegister ? "Criar conta" : "Entrar no Campus Consciente"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Cadastre-se para anunciar materiais no mural."
              : "Acesse sua conta para gerenciar seus anúncios."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
              />
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading
                ? "Aguarde..."
                : isRegister
                  ? "Criar conta"
                  : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isRegister ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
            </span>{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Entrar" : "Cadastre-se"}
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
