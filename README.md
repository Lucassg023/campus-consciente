# 🌱 Campus Consciente

**Plataforma web de sustentabilidade, descarte seletivo e reaproveitamento de materiais acadêmicos.**

O Campus Consciente é um projeto desenvolvido para o **Projeto Integrador Transdisciplinar em Engenharia de Software**, da **Cruzeiro do Sul Virtual**, com foco no **Objetivo de Desenvolvimento Sustentável 12 (ODS 12): Consumo e Produção Responsáveis**.

A aplicação busca incentivar hábitos sustentáveis no ambiente acadêmico, facilitando o acesso a informações sobre descarte de resíduos e promovendo a reutilização de materiais por meio de trocas e doações.

### 🔗 Acesse o projeto

- **Aplicação online:** https://campus-consciente.goncalveslucasnome11.workers.dev
- **Repositório:** https://github.com/Lucassg023/campus-consciente

## Funcionalidades

### ♻️ Guia de descarte seletivo

Permite consultar pontos de coleta e identificar os materiais aceitos em cada local.

- Navegação por categorias de materiais.
- Busca por material ou localização.
- Filtragem de pontos de coleta.
- Exibição de informações sobre os locais de coleta.

### 📚 Mural de trocas e doações

Espaço destinado ao compartilhamento e reaproveitamento de materiais acadêmicos.

- Consulta pública aos anúncios.
- Filtros por categoria e modalidade.
- Publicação de anúncios por usuários autenticados.
- Escolha dos meios de contato: e-mail, telefone ou ambos.
- Edição e exclusão de anúncios pelo autor.
- Alteração do status entre disponível e concluído.

### 🔐 Autenticação

O sistema utiliza o Supabase Auth para cadastro e autenticação de usuários.

As operações de gerenciamento de anúncios são associadas ao usuário responsável, com políticas de segurança no banco de dados.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React | Construção da interface |
| TypeScript | Desenvolvimento da aplicação |
| TanStack Start / Router | Estrutura e roteamento |
| Tailwind CSS | Estilização responsiva |
| Supabase | Autenticação e banco de dados PostgreSQL |
| Cloudflare Workers | Hospedagem da aplicação |
| Git e GitHub | Versionamento e disponibilização do código |

O Lovable foi utilizado como ferramenta de apoio à prototipação e à geração inicial da interface. Posteriormente, o projeto passou por desenvolvimento, integração com o Supabase, ajustes no código e implementação de novas funcionalidades.

## Desenvolvimento local

### Pré-requisitos

- Node.js
- npm

### Instalação

Clone o repositório:

```bash
git clone https://github.com/Lucassg023/campus-consciente.git
cd campus-consciente
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto e configure as variáveis públicas de conexão com o Supabase:

```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

As variáveis devem corresponder às utilizadas em `src/lib/supabase.ts`. Nunca adicione chaves administrativas ou secretas ao repositório.

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

## Melhorias implementadas após os testes

Durante a etapa de avaliação da solução, foram identificadas oportunidades de melhoria na experiência de uso.

**1. Personalização dos meios de contato:** implementação de checkboxes para selecionar e-mail, telefone ou ambos, com exibição dinâmica dos campos e validação dos dados.

**2. Edição de anúncios:** possibilidade de modificar informações de anúncios existentes, sem precisar excluí-los e publicá-los novamente.

**3. Navegação no guia de descarte:** reorganização visual das categorias com ícones e elementos mais destacados, facilitando a localização dos materiais e pontos de coleta.

## Documentação acadêmica

A documentação do projeto está disponível na pasta [`docs`](./docs).

- [Documentação original da PIT I](./docs/PIT_I_original.pdf)
- [Documentação atualizada do projeto](./docs/DOCUMENTACAO_ATUALIZADA.md)

## Vídeos de demonstração

- [Vídeo 1: Apresentação da solução](https://www.youtube.com/watch?v=zB-lUbWOf6c)
- [Vídeo 2: Melhorias implementadas e testes da solução](https://www.youtube.com/watch?v=4_AL6lTG-L4)

## Objetivo e impacto

O Campus Consciente busca contribuir para a conscientização ambiental, a redução do desperdício e o fortalecimento de práticas de economia circular no ambiente acadêmico.

O projeto demonstra a aplicação de conhecimentos de Engenharia de Software na construção de uma solução web voltada a um problema social e ambiental.

---

**Projeto acadêmico desenvolvido para a Cruzeiro do Sul Virtual.**