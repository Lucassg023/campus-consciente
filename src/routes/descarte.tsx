
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/descarte")({
  head: () => ({
    meta: [
      { title: "Guia de Descarte Seletivo | Campus Consciente" },
      {
        name: "description",
        content: "Encontre os pontos de coleta do campus.",
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

const FILTROS = [
  "Todos",
  "Eletrônicos",
  "Papel",
  "Pilhas",
  "Plástico",
  "Metal",
  "Vidro",
];

async function fetchCollectionPoints(): Promise<CollectionPoint[]> {
  const { data, error } = await supabase
    .from("collection_points")
    .select("id, name, description, location, accepted_materials")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

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
    const texto = [
      p.name,
      p.location,
      p.description ?? "",
      ...p.accepted_materials,
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    const correspondeBusca = !termo || texto.includes(termo);

    const correspondeFiltro =
      f === "Todos" ||
      p.accepted_materials.some(
        (material) =>
          material.toLocaleLowerCase("pt-BR") ===
          f.toLocaleLowerCase("pt-BR")
      );

    return correspondeBusca && correspondeFiltro;
  });

  return (
    <SiteShell>
      <section className="container-page py-12">
        <h1 className="font-display text-4xl font-bold">
          Guia de Descarte Seletivo
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Encontre o ponto de coleta certo para cada material.
        </p>

        <div className="relative mt-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por material ou local"
            className="h-12 pl-10"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTROS.map((x) => (
            <button
              key={x}
              onClick={() => setF(x)}
              className={`chip ${f === x ? "chip-active" : ""}`}
            >
              {x}
            </button>
          ))}
        </div>

        {isPending && (
          <p className="mt-8 text-muted-foreground">
            Carregando pontos de coleta...
          </p>
        )}

        {isError && (
          <div className="mt-8 rounded-xl border border-destructive p-5">
            <p className="font-semibold">
              Não foi possível carregar os pontos de coleta.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Erro desconhecido."}
            </p>
            <button
              onClick={() => void refetch()}
              className="mt-4 text-sm font-semibold text-primary"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isPending && !isError && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {lista.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <h2 className="font-display text-xl font-semibold">
                  {p.name}
                </h2>

                <p className="mt-3 flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p.location}
                </p>

                {p.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.accepted_materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </article>
            ))}

            {lista.length === 0 && (
              <p className="text-muted-foreground">
                Nenhum ponto encontrado para essa busca.
              </p>
            )}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
