import { useEffect, useState } from "react";

export type Ponto = {
  id: string;
  nome: string;
  local: string;
  materiais: string[];
  horario: string;
  status: "aberto" | "manutencao";
};

export type Item = {
  id: string;
  titulo: string;
  categoria: "Livros" | "Ferramentas" | "Material Escolar";
  modalidade: "Troca" | "Doação";
  contato: string;
  descricao: string;
  concluido: boolean;
  criadoEm: number;
};

export const PONTOS: Ponto[] = [
  { id: "p1", nome: "Lixo Eletrônico", local: "Bloco A — Térreo, ao lado dos elevadores", materiais: ["Eletrônicos", "Cabos", "Celulares"], horario: "Seg–Sex, 7h às 22h", status: "aberto" },
  { id: "p2", nome: "Papelão e Papel", local: "Biblioteca Central — Entrada principal", materiais: ["Papel", "Papelão", "Revistas"], horario: "Seg–Sáb, 8h às 21h", status: "aberto" },
  { id: "p3", nome: "Pilhas e Baterias", local: "Centro Acadêmico — Sala 12", materiais: ["Pilhas", "Baterias"], horario: "Seg–Sex, 9h às 18h", status: "manutencao" },
  { id: "p4", nome: "Plásticos e Metais", local: "Restaurante Universitário — Pátio externo", materiais: ["Plásticos", "Latas", "Garrafas PET"], horario: "Todos os dias, 10h às 20h", status: "aberto" },
  { id: "p5", nome: "Orgânicos / Compostagem", local: "Horta Comunitária — Bloco D", materiais: ["Alimentos", "Borra de café"], horario: "Seg–Sex, 7h às 17h", status: "aberto" },
];

const SEED: Item[] = [
  { id: "i1", titulo: "Cálculo Vol. 1 — James Stewart", categoria: "Livros", modalidade: "Doação", contato: "ana.souza@campus.edu", descricao: "Livro em ótimo estado, poucas anotações a lápis.", concluido: false, criadoEm: 4 },
  { id: "i2", titulo: "Calculadora Científica HP 50g", categoria: "Ferramentas", modalidade: "Troca", contato: "(85) 99876-5432", descricao: "Funcionando perfeitamente. Troco por livro de Física ou régua T.", concluido: false, criadoEm: 3 },
  { id: "i3", titulo: "Régua T 80cm", categoria: "Ferramentas", modalidade: "Doação", contato: "pedro.lima@campus.edu", descricao: "Usada apenas um semestre em Desenho Técnico.", concluido: false, criadoEm: 2 },
  { id: "i4", titulo: "Kit 5 cadernos universitários", categoria: "Material Escolar", modalidade: "Doação", contato: "(85) 98765-1234", descricao: "Cadernos novos, ainda lacrados, 10 matérias.", concluido: false, criadoEm: 1 },
];

const KEY = "ods12-mural-itens";

export function useItens() {
  const [itens, setItens] = useState<Item[]>(SEED);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItens(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(itens));
  }, [itens, ready]);

  return {
    itens,
    add: (i: Omit<Item, "id" | "concluido" | "criadoEm">) =>
      setItens((p) => [{ ...i, id: crypto.randomUUID(), concluido: false, criadoEm: Date.now() }, ...p]),
    remove: (id: string) => setItens((p) => p.filter((x) => x.id !== id)),
    toggle: (id: string) => setItens((p) => p.map((x) => (x.id === id ? { ...x, concluido: !x.concluido } : x))),
  };
}
