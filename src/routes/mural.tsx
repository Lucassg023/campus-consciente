
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { Plus, Trash2, Check, Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mural")({
  component: Mural,
});

type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  exchange_type: "troca" | "doacao";
  status: "disponivel" | "concluido";
  contact: string;
  created_at: string;
};

type ListingForm = {
  title: string;
  description: string;
  category: string;
  exchange_type: "troca" | "doacao";
  contact: string;
};

const CATS = ["Todas", "Livros", "Ferramentas", "Material Escolar"];
const TIPOS = ["Todos", "Troca", "Doação"];

function Mural() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cat, setCat] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setUser(error ? null : data.user);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const {
    data: itens = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, user_id, title, description, category, exchange_type, status, contact, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Listing[];
    },
  });

  const lista = itens.filter((i) => {
    const categoriaOk = cat === "Todas" || i.category === cat;
    const tipoOk =
      tipo === "Todos" ||
      (tipo === "Troca" && i.exchange_type === "troca") ||
      (tipo === "Doação" && i.exchange_type === "doacao");

    return categoriaOk && tipoOk;
  });

  function handleAnunciar() {
    if (authLoading) return;

    if (!user) {
      toast.info("Faça login para publicar um anúncio.");
      void navigate({ to: "/login" });
      return;
    }

    setOpen(true);
  }

  async function addItem(form: ListingForm) {
    if (!user) {
      toast.error("Faça login para publicar um anúncio.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        exchange_type: form.exchange_type,
        contact: form.contact,
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      setOpen(false);
      toast.success("Item anunciado com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar o anúncio."
      );
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function toggleItem(item: Listing) {
    if (!user || item.user_id !== user.id) return;

    setBusyId(item.id);

    try {
      const novoStatus =
        item.status === "concluido" ? "disponivel" : "concluido";

      const { error } = await supabase
        .from("listings")
        .update({ status: novoStatus })
        .eq("id", item.id)
        .eq("user_id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["listings"] });

      toast.success(
        novoStatus === "concluido"
          ? "Item marcado como concluído!"
          : "Item reaberto."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o anúncio."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item: Listing) {
    if (!user || item.user_id !== user.id) return;

    if (!window.confirm("Deseja realmente excluir este anúncio?")) return;

    setBusyId(item.id);

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", item.id)
        .eq("user_id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Item excluído.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o anúncio."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SiteShell>
      <section className="container-page py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">
              Mural de Trocas e Doações
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Dê nova vida aos seus materiais acadêmicos.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleAnunciar}
            disabled={authLoading}
            className="shadow-lift"
          >
            <Plus /> Anunciar Item
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip ${cat === c ? "chip-active" : ""}`}
            >
              {c}
            </button>
          ))}

          <span className="mx-2 h-6 w-px bg-border" />

          {TIPOS.map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`chip ${tipo === t ? "chip-active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="mt-8 text-muted-foreground">
            Carregando anúncios...
          </p>
        )}

        {isError && (
          <div className="mt-8">
            <p className="text-destructive">
              Não foi possível carregar os anúncios.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={user?.id === item.user_id}
                disabled={busyId === item.id}
                onToggle={() => void toggleItem(item)}
                onRemove={() => void removeItem(item)}
              />
            ))}

            {lista.length === 0 && (
              <p className="text-muted-foreground">
                Nenhum item nesta combinação de filtros.
              </p>
            )}
          </div>
        )}
      </section>

      <AnuncioModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={addItem}
        saving={saving}
      />
    </SiteShell>
  );
}

function ItemCard({
  item,
  isOwner,
  disabled,
  onToggle,
  onRemove,
}: {
  item: Listing;
  isOwner: boolean;
  disabled: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const concluido = item.status === "concluido";
  const modalidade =
    item.exchange_type === "doacao" ? "Doação" : "Troca";

  return (
    <article
      className={`flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-opacity ${
        concluido ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {item.category}
        </span>
        <span
          className={
            modalidade === "Doação" ? "tag-doacao" : "tag-troca"
          }
        >
          {modalidade}
        </span>
      </div>

      <h3
        className={`mt-3 font-display text-lg font-semibold ${
          concluido ? "line-through" : ""
        }`}
      >
        {item.title}
      </h3>

      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {item.description}
      </p>

      <p className="mt-4 flex items-center gap-2 text-sm font-medium">
        <Mail className="h-4 w-4 text-primary" />
        {item.contact}
      </p>

      {isOwner && (
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onToggle}
            disabled={disabled}
          >
            {concluido ? (
              <>
                <RotateCcw /> Reabrir
              </>
            ) : (
              <>
                <Check /> Concluído
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Excluir"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </article>
  );
}

function AnuncioModal({
  open,
  onOpenChange,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: ListingForm) => Promise<void>;
  saving: boolean;
}) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [contato, setContato] = useState("");
  const [descricao, setDescricao] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const faltando = [
      !titulo.trim() && "Título",
      !categoria && "Categoria",
      !modalidade && "Modalidade",
      !contato.trim() && "Contato",
      !descricao.trim() && "Descrição",
    ].filter(Boolean);

    if (faltando.length) {
      toast.error(
        `Preencha os campos obrigatórios: ${faltando.join(", ")}.`
      );
      return;
    }

    try {
      await onSubmit({
        title: titulo.trim(),
        category: categoria,
        exchange_type: modalidade === "Doação" ? "doacao" : "troca",
        contact: contato.trim(),
        description: descricao.trim(),
      });

      setTitulo("");
      setCategoria("");
      setModalidade("");
      setContato("");
      setDescricao("");
    } catch {
      // O componente principal já apresenta o erro.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Anunciar Item
          </DialogTitle>
          <DialogDescription>
            Compartilhe um material para troca ou doação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="t">Título do item *</Label>
            <Input
              id="t"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Livro de Física I"
            />
          </div>

          <div className="grid gap-2">
            <Label>Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {["Livros", "Ferramentas", "Material Escolar"].map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Modalidade *</Label>
            <RadioGroup
              value={modalidade}
              onValueChange={setModalidade}
              className="flex gap-6"
            >
              {["Troca", "Doação"].map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <RadioGroupItem value={m} id={m} />
                  <Label htmlFor={m}>{m}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="c">
              Contato (e-mail ou WhatsApp) *
            </Label>
            <Input
              id="c"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="seu@email.com ou (85) 9..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="d">Descrição detalhada *</Label>
            <Textarea
              id="d"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Estado de conservação, edição, etc."
            />
          </div>

          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Publicando..." : "Publicar anúncio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
