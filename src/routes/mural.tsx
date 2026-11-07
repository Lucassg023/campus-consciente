import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { Plus, Trash2, Check, RotateCcw, Pencil } from "lucide-react";
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
  const [editingItem, setEditingItem] = useState<Listing | null>(null);
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
    setEditingItem(null);
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
  function handleEditar(item: Listing) {
    if (!user || item.user_id !== user.id) return;
    setEditingItem(item);
    setOpen(true);
  }

  async function saveEdit(form: ListingForm) {
    if (!user || !editingItem || editingItem.user_id !== user.id) {
      toast.error("Você não tem permissão para editar este anúncio.");
      throw new Error("Sem permissão para editar.");
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .update({
          title: form.title,
          description: form.description,
          category: form.category,
          exchange_type: form.exchange_type,
          contact: form.contact,
        })
        .eq("id", editingItem.id)
        .eq("user_id", user.id)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("O anúncio não foi atualizado. Verifique as permissões.");
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      setOpen(false);
      setEditingItem(null);
      toast.success("Anúncio atualizado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível editar o anúncio.");
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
                onEdit={() => handleEditar(item)}
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
        key={editingItem?.id ?? "novo"}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setEditingItem(null);
        }}
        item={editingItem}
        onSubmit={editingItem ? saveEdit : addItem}
        saving={saving}
      />
    </SiteShell>
  );
}
function ItemCard({
  item,
  isOwner,
  disabled,
  onEdit,
  onToggle,
  onRemove,
}: {
  item: Listing;
  isOwner: boolean;
  disabled: boolean;
  onEdit: () => void;
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
      <p className="mt-4 whitespace-pre-line break-words text-sm font-medium">
        {item.contact}
      </p>
      {isOwner && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={disabled}>
            <Pencil className="h-4 w-4" /> Editar
          </Button>
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
  item,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Listing | null;
  onSubmit: (form: ListingForm) => Promise<void>;
  saving: boolean;
}) {
  // Os anúncios antigos podem conter um contato simples, sem prefixo.
  // Para preservar a compatibilidade, interpretamos e-mail e telefone existentes.
  const contatoAtual = item?.contact ?? "";
  const emailAtual = contatoAtual.match(/(?:^|\n)E-mail:\s*([^\n]+)/i)?.[1]?.trim()
    ?? (contatoAtual.includes("@") && !contatoAtual.includes("E-mail:") ? contatoAtual.trim() : "");
  const telefoneAtual = contatoAtual.match(/(?:^|\n)Telefone:\s*([^\n]+)/i)?.[1]?.trim()
    ?? (!contatoAtual.includes("@") && !contatoAtual.includes("Telefone:") ? contatoAtual.trim() : "");
  const [titulo, setTitulo] = useState(item?.title ?? "");
  const [categoria, setCategoria] = useState(item?.category ?? "");
  const [modalidade, setModalidade] = useState(item ? (item.exchange_type === "doacao" ? "Doação" : "Troca") : "");
  const [usarEmail, setUsarEmail] = useState(Boolean(emailAtual));
  const [usarTelefone, setUsarTelefone] = useState(Boolean(telefoneAtual));
  const [email, setEmail] = useState(emailAtual);
  const [telefone, setTelefone] = useState(telefoneAtual);
  const [descricao, setDescricao] = useState(item?.description ?? "");
  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (!numeros) return "";
    if (numeros.length <= 2) return `(${numeros}`;
    const ddd = numeros.slice(0, 2);
    const restante = numeros.slice(2);
    const tamanhoPrefixo = numeros.length > 10 ? 5 : 4;
    if (restante.length <= tamanhoPrefixo) return `(${ddd}) ${restante}`;
    return `(${ddd}) ${restante.slice(0, tamanhoPrefixo)}-${restante.slice(tamanhoPrefixo)}`;
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const faltando = [
      !titulo.trim() && "Título",
      !categoria && "Categoria",
      !modalidade && "Modalidade",
      !usarEmail && !usarTelefone && "Forma de contato",
      usarEmail && !email.trim() && "E-mail",
      usarTelefone && !telefone.trim() && "Telefone",
      !descricao.trim() && "Descrição",
    ].filter(Boolean);
    if (faltando.length) {
      toast.error(
        `Preencha os campos obrigatórios: ${faltando.join(", ")}.`
      );
      return;
    }
    if (usarEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    const digitosTelefone = telefone.replace(/\D/g, "");
    if (usarTelefone && (!/^[\d\s()+.-]+$/.test(telefone.trim()) || ![10, 11].includes(digitosTelefone.length))) {
      toast.error("Informe um telefone brasileiro com DDD e 10 ou 11 dígitos.");
      return;
    }
    const contatos = [
      ...(usarEmail ? [`E-mail: ${email.trim()}`] : []),
      ...(usarTelefone ? [`Telefone: ${telefone.trim()}`] : []),
    ].join("\n");
    try {
      await onSubmit({
        title: titulo.trim(),
        category: categoria,
        exchange_type: modalidade === "Doação" ? "doacao" : "troca",
        contact: contatos,
        description: descricao.trim(),
      });
      setTitulo("");
      setCategoria("");
      setModalidade("");
      setUsarEmail(false);
      setUsarTelefone(false);
      setEmail("");
      setTelefone("");
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
            {item ? "Editar anúncio" : "Anunciar Item"}
          </DialogTitle>
          <DialogDescription>
            {item ? "Atualize os dados do seu anúncio." : "Compartilhe um material para troca ou doação."}
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
          <fieldset className="grid gap-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium">
              Como você prefere ser contatado? *
            </legend>
            <p className="text-sm text-muted-foreground">
              Selecione uma ou ambas as opções. Os contatos selecionados ficarão públicos no anúncio.
            </p>
            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <input
                  id="usar-email"
                  type="checkbox"
                  checked={usarEmail}
                  onChange={(e) => setUsarEmail(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                  style={{ appearance: "auto", borderRadius: 2 }}
                />
                <Label htmlFor="usar-email">E-mail</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="usar-telefone"
                  type="checkbox"
                  checked={usarTelefone}
                  onChange={(e) => setUsarTelefone(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                  style={{ appearance: "auto", borderRadius: 2 }}
                />
                <Label htmlFor="usar-telefone">Telefone</Label>
              </div>
            </div>
            {usarEmail && (
              <div className="grid gap-2">
                <Label htmlFor="contato-email">E-mail de contato *</Label>
                <Input
                  id="contato-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            )}
            {usarTelefone && (
              <div className="grid gap-2">
                <Label htmlFor="contato-telefone">Telefone com DDD *</Label>
                <Input
                  id="contato-telefone"
                  type="tel"
                  inputMode="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  maxLength={15}
                  placeholder="(83) 99999-9999"
                />
              </div>
            )}
          </fieldset>
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
            {saving ? "Salvando..." : item ? "Salvar alterações" : "Publicar anúncio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
