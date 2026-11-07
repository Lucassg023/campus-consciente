import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, BookOpen, MapPin, ArrowRight, Recycle } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Consciente — ODS 12 na universidade" },
      { name: "description", content: "Painel de consumo consciente do campus: métricas de reciclagem, dicas e economia circular." },
      { property: "og:title", content: "Campus Consciente — ODS 12 na universidade" },
      { property: "og:description", content: "Métricas de reciclagem, dicas de consumo e economia circular no campus." },
    ],
  }),
  component: Home,
});

const METRICAS = [
  { icon: FileText, valor: "1.284", unidade: "kg", label: "Papel reciclado este mês", delta: "+12% vs. mês anterior" },
  { icon: BookOpen, valor: "347", unidade: "", label: "Livros reaproveitados", delta: "+58 neste semestre" },
  { icon: MapPin, valor: "18", unidade: "", label: "Pontos de coleta ativos", delta: "2 em manutenção" },
];

const CATS = ["Todas", "Papel", "Eletrônicos", "Alimentos", "Plásticos"] as const;
const DICAS = [
  { cat: "Papel", t: "Imprima frente e verso", d: "Configure a impressora para duplex por padrão e prefira PDFs para leitura." },
  { cat: "Papel", t: "Reaproveite rascunhos", d: "Folhas impressas de um lado viram ótimos blocos de anotação." },
  { cat: "Eletrônicos", t: "Descarte no ponto certo", d: "Celulares e cabos têm metais tóxicos — leve ao coletor do Bloco A." },
  { cat: "Eletrônicos", t: "Conserte antes de trocar", d: "Baterias e telas podem ser substituídas, prolongando a vida útil." },
  { cat: "Alimentos", t: "Sirva só o que vai comer", d: "No RU, comece com porções menores; você sempre pode repetir." },
  { cat: "Alimentos", t: "Composte a borra de café", d: "Leve à horta comunitária do Bloco D." },
  { cat: "Plásticos", t: "Traga sua garrafa", d: "Bebedouros com refil estão em todos os blocos." },
  { cat: "Plásticos", t: "Recuse descartáveis", d: "Leve sua própria caneca e talheres para a cantina." },
];

function Home() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todas");
  const dicas = DICAS.filter((d) => cat === "Todas" || d.cat === cat);
  return (
    <SiteShell>
      <section className="hero-gradient">
        <div className="container-page grid gap-8 py-16 md:py-24">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            <Recycle className="h-4 w-4" /> ODS 12 · Agenda 2030
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
            Consumir menos, reaproveitar mais. O campus muda com você.
          </h1>
          <p className="max-w-2xl text-lg text-primary-foreground/85">
            Descubra onde descartar corretamente, troque materiais acadêmicos e acompanhe o impacto da nossa comunidade.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/mural">Ver Mural de Trocas <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/descarte">Guia de descarte</Link></Button>
          </div>
        </div>
      </section>

      <section className="container-page -mt-10 grid gap-4 md:grid-cols-3">
        {METRICAS.map((m) => (
          <div key={m.label} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <m.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-4xl font-bold">{m.valor}<span className="ml-1 text-xl text-muted-foreground">{m.unidade}</span></p>
            <p className="mt-1 font-medium">{m.label}</p>
            <p className="mt-2 text-sm text-primary">{m.delta}</p>
          </div>
        ))}
      </section>

      <section className="container-page mt-16">
        <h2 className="font-display text-3xl font-bold">Dicas rápidas de consumo consciente</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`chip ${cat === c ? "chip-active" : ""}`}>{c}</button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dicas.map((d) => (
            <article key={d.t} className="rounded-2xl border border-border bg-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{d.cat}</span>
              <h3 className="mt-2 font-semibold">{d.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.d}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
