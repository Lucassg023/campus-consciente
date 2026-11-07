import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Laptop,
  FileText,
  Battery,
  Recycle,
  Wine,
  Layers,
  X,
  ArrowRight,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/descarte")({
  head: () => ({
    meta: [
      { title: "Guia de Descarte Seletivo | Campus Consciente" },
      {
        name: "description",
        content: "Encontre pontos de coleta por tipo de material no Campus Consciente.",
      },
    ],
  }),
  component: Descarte,
});

type CollectionPoint = {
  id: string;
  name: string;
  description: string | null;
  location: string;
  accepted_materials: string[];
};

const CATEGORIAS = [
  { nome: "Eletrônicos", descricao: "Computadores e aparelhos", icon: Laptop },
  { nome: "Papel", descricao: "Folhas e papelão", icon: FileText },
  { nome: "Pilhas", descricao: "Pilhas e baterias", icon: Battery },
  { nome: "Plástico", descricao: "Embalagens plásticas", icon: Recycle },
  { nome: "Metal", descricao: "Latas e metais", icon: Recycle },
  { nome: "Vidro", descricao: "Garrafas e recipientes", icon: Wine },
] as const;

async function fetchCollectionPoints(): Promise<CollectionPoint[]> {
  const { data, error } = await supabase
    .from("collection_points")
    .select("id, name, description, location, accepted_materials")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

function Descarte() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("Todos");

  const {
    data: pontos = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collection-points"],
    queryFn: fetchCollectionPoints,
  });

  const termo = q.trim().toLocaleLowerCase("pt-BR");

  const lista = pontos.filter((p) => {
    const materiais = p.accepted_materials ?? [];
    const texto = [p.name, p.location, p.description ?? "", ...materiais]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    const correspondeBusca = !termo || texto.includes(termo);
    const correspondeFiltro =
      f === "Todos" ||
      materiais.some(
        (material) =>
          material.toLocaleLowerCase("pt-BR") === f.toLocaleLowerCase("pt-BR")
      );

    return correspondeBusca && correspondeFiltro;
  });

  function limparFiltros() {
    setQ("");
    setF("Todos");
  }

  return (
    <SiteShell>
      <section className="container-page py-12">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Descarte consciente
          </p>
          <h1 className="font-display text-4xl font-bold">
            Guia de Descarte Seletivo
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Selecione o material que deseja descartar e encontre os pontos de
            coleta que podem recebê-lo.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Qual material você quer descartar?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma categoria para filtrar os pontos de coleta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setF("Todos")}
              aria-pressed={f === "Todos"}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                f === "Todos"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
              }`}
            >
              <Layers className="h-4 w-4" />
              Todos os materiais
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIAS.map(({ nome, descricao, icon: Icon }) => {
              const selecionado = f === nome;
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setF(nome)}
                  aria-pressed={selecionado}
                  className={`group flex min-h-40 flex-col items-start rounded-2xl border p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selecionado
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      selecionado
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 text-sm font-bold leading-tight text-foreground">
                    {nome}
                  </span>
                  <span className="mt-1 text-xs leading-snug text-muted-foreground">
                    {descricao}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Pontos de coleta
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulte os locais e os materiais aceitos em cada ponto.
              </p>
            </div>
            {(f !== "Todos" || q) && (
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="relative mt-5 max-w-xl">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Buscar ponto de coleta, material ou local"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por material, ponto ou local"
              className="h-12 pl-10"
            />
          </div>

          {!isPending && !isError && (
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-live="polite">
              <span className="text-sm text-muted-foreground">
                {lista.length} {lista.length === 1 ? "ponto encontrado" : "pontos encontrados"}
              </span>
              {f !== "Todos" && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Categoria: {f}
                </span>
              )}
            </div>
          )}

          {isPending && (
            <p className="mt-8 text-muted-foreground" role="status">
              Carregando pontos de coleta...
            </p>
          )}

          {isError && (
            <div className="mt-8 rounded-xl border border-destructive p-5" role="alert">
              <p className="font-semibold">
                Não foi possível carregar os pontos de coleta.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Erro desconhecido."}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isPending && !isError && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {lista.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">
                      {p.name}
                    </h3>
                    <MapPin
                      className="h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-sm">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {p.location}
                  </p>

                  {p.description && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Materiais aceitos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(p.accepted_materials ?? []).map((material) => (
                        <span
                          key={material}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                            f !== "Todos" &&
                            material.toLocaleLowerCase("pt-BR") ===
                              f.toLocaleLowerCase("pt-BR")
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}

              {lista.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                  <Search
                    className="mx-auto h-8 w-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    Nenhum ponto encontrado
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não encontramos pontos que correspondam aos filtros selecionados.
                  </p>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Ver todos os pontos <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
