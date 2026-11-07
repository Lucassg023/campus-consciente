# Campus Consciente
## Documentação atualizada: continuidade da PIT I para a PIT II

**Curso:** Engenharia de Software  
**Instituição:** Cruzeiro do Sul Virtual  
**Autor:** Lucas de Souza Gonçalves  
**RGM:** 32980736  
**Tema:** ODS 12, Consumo e Produção Responsáveis

> Este documento atualiza a proposta de intervenção apresentada na PIT I com base na implementação realizada na PIT II. A documentação original permanece disponível separadamente para consulta histórica.

## 1. Situação-problema

A proposta original da PIT I abordou a necessidade de incentivar práticas de consumo e produção responsáveis no ambiente acadêmico, reduzindo o descarte inadequado e o desperdício de materiais por meio de informação acessível e participação comunitária.

## 2. Objetivo

Desenvolver uma aplicação web responsiva que auxilie na localização de pontos de coleta seletiva e incentive o reaproveitamento de materiais acadêmicos por meio de anúncios de trocas e doações.

## 3. Fundamentação conceitual

O projeto aplica conceitos de Engenharia de Software, levantamento de requisitos, desenvolvimento web, persistência de dados, autenticação, controle de acesso e UX/UI. A proposta está alinhada ao ODS 12. A PIT I registrou o uso de Design Thinking, planejamento iterativo e prototipação assistida pela ferramenta Lovable.

## 4. Evolução da solução

Na PIT I, o projeto foi descrito como um protótipo criado com apoio da Lovable, incluindo a proposta de um mapa interativo de coleta. Na PIT II, a solução evoluiu para uma aplicação com React, TypeScript, TanStack Start e Tailwind CSS, integrada ao Supabase e publicada no Cloudflare Workers. A funcionalidade implementada para coleta é um **guia com categorias, pesquisa e listagem de pontos**, não um mapa geográfico interativo.

## 5. Escopo e funcionalidades implementadas

### 5.1 Página inicial

Apresenta a proposta do Campus Consciente e direciona o visitante às funcionalidades principais.

### 5.2 Guia de descarte seletivo

- Consulta a pontos de coleta cadastrados e ativos.
- Busca por nome, local, descrição e materiais aceitos.
- Seleção de categorias, como Eletrônicos, Papel, Pilhas, Plástico, Metal e Vidro.
- Exibição de nome, localização, descrição e materiais aceitos em cada ponto.
- Navegação por cartões de categorias com ícones, introduzida após a avaliação de usabilidade.

### 5.3 Mural de trocas e doações

- Visualização pública de anúncios.
- Filtros por categoria e modalidade (troca ou doação).
- Cadastro e autenticação para publicar anúncios.
- Criação de anúncios com título, descrição, categoria, modalidade e contato.
- Seleção de e-mail, telefone ou ambos como meios de contato, com campos condicionais e validação.
- Edição de anúncios pelo autor, inclusive dos dados de contato.
- Exclusão e alteração de status (disponível/concluído) pelo autor.

## 6. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF01 | Consultar pontos de coleta ativos. |
| RF02 | Buscar e filtrar pontos de coleta por material. |
| RF03 | Visualizar anúncios públicos de trocas e doações. |
| RF04 | Filtrar anúncios por categoria e modalidade. |
| RF05 | Cadastrar-se e autenticar-se para publicar anúncios. |
| RF06 | Criar anúncio com informações do material. |
| RF07 | Selecionar os meios de contato exibidos publicamente. |
| RF08 | Editar anúncios próprios. |
| RF09 | Excluir anúncios próprios. |
| RF10 | Alterar o status de anúncios próprios. |

## 7. Requisitos não funcionais

- Interface responsiva para computador e dispositivos móveis.
- Persistência dos anúncios em banco PostgreSQL gerenciado pelo Supabase.
- Autenticação por Supabase Auth.
- Controle de acesso às operações de escrita por meio de verificações de autoria e políticas RLS configuradas no banco.
- Hospedagem web no Cloudflare Workers.
- Disponibilização do código-fonte no GitHub.

## 8. Arquitetura e tecnologias

| Camada | Tecnologia / responsabilidade |
| --- | --- |
| Interface | React, TypeScript, Tailwind CSS |
| Aplicação e rotas | TanStack Start / TanStack Router |
| Consultas e atualização de dados na interface | TanStack Query |
| Autenticação | Supabase Auth |
| Persistência | Supabase PostgreSQL |
| Controle de acesso | Políticas Row Level Security (RLS) e verificações de autoria nas operações |
| Hospedagem | Cloudflare Workers |
| Versionamento | Git e GitHub |
| Prototipação inicial | Lovable |

O navegador acessa a aplicação hospedada e interage com os serviços do Supabase para autenticação e operações autorizadas sobre os dados. A existência de RLS é documentada, mas uma auditoria completa de segurança não faz parte das evidências disponíveis.

## 9. Projeto de dados e dicionário de dados

As tabelas identificadas na implementação são `profiles`, `collection_points` e `listings`, além das estruturas de autenticação gerenciadas pelo Supabase. A relação abaixo documenta os campos confirmados pelo código analisado. Campos internos adicionais, índices, restrições e chaves estrangeiras devem ser conferidos diretamente no painel do banco antes de uma documentação física definitiva.

### 9.1 `listings`

| Campo | Tipo lógico | Finalidade |
| --- | --- | --- |
| `id` | Identificador | Identificação única do anúncio. |
| `user_id` | Identificador de usuário | Autor responsável pelo anúncio. |
| `title` | Texto | Título do item. |
| `description` | Texto opcional | Detalhes do item. |
| `category` | Texto | Categoria do material. |
| `exchange_type` | Enum lógico (`troca`, `doacao`) | Modalidade do anúncio. |
| `status` | Enum lógico (`disponivel`, `concluido`) | Estado do anúncio. |
| `contact` | Texto | Contatos escolhidos pelo autor, armazenados no formato textual exibido no anúncio. |
| `created_at` | Data/hora | Data de criação para ordenação. |

**Observação:** e-mail e telefone não foram identificados como colunas separadas na implementação examinada. O formulário reúne os meios selecionados no campo `contact`.

### 9.2 `collection_points`

| Campo | Tipo lógico | Finalidade |
| --- | --- | --- |
| `id` | Identificador | Identificação única do ponto. |
| `name` | Texto | Nome do ponto de coleta. |
| `description` | Texto opcional | Informações adicionais. |
| `location` | Texto | Localização descritiva. |
| `accepted_materials` | Lista de textos | Categorias de resíduos aceitas. |
| `is_active` | Booleano | Define se o ponto aparece na consulta pública. |

### 9.3 `profiles`

A existência da tabela `profiles` faz parte da arquitetura informada do projeto, mas seus campos não foram verificados nos arquivos analisados. O detalhamento físico deve ser complementado a partir do esquema real do Supabase, sem presumir colunas.

## 10. Fluxos principais da aplicação

**Consultar descarte:** acessar Guia de Descarte → selecionar categoria ou pesquisar → visualizar pontos correspondentes.

**Publicar anúncio:** acessar Mural → autenticar-se → abrir formulário → informar material e selecionar contatos → validar → salvar no Supabase → visualizar no mural.

**Editar anúncio:** autenticar-se como autor → localizar anúncio próprio → selecionar Editar → alterar informações → salvar → consultar dados atualizados.

**Concluir ou excluir anúncio:** autenticar-se como autor → selecionar ação no anúncio próprio → atualizar ou excluir registro autorizado.

## 11. Testes e melhorias na PIT II

Foram documentados cinco cenários de avaliação da aplicação na entrega da PIT II, envolvendo consulta ao guia de descarte, localização de anúncios e cadastro/publicação. A partir dos problemas registrados, três melhorias foram implementadas e verificadas no funcionamento da aplicação:

1. **Meios de contato:** checkboxes para e-mail e telefone, campos condicionais e validação.
2. **Edição de anúncios:** atualização dos dados pelo próprio autor sem recriar o anúncio.
3. **Guia de descarte:** categorias em cartões visuais, com ícones e identificação mais clara.

As capturas de tela do antes e depois e a descrição dos resultados constam no relatório da PIT II. A documentação não afirma testes de segurança aprofundados nem medições quantitativas de usabilidade que não foram fornecidas.

## 12. Metodologia e cronologia

A PIT I registrou planejamento iterativo inspirado em Scrum, abordagem Design Thinking, prototipação com Lovable e um total estimado de **55 horas ao longo de três semanas** para aquela etapa. Esse registro histórico não deve ser confundido com a duração acumulada da PIT II, para a qual não foi apresentada uma contagem de horas consolidada.

Na continuidade, foram realizadas integração de autenticação e persistência, implementação das funcionalidades, publicação web, avaliações da solução e correções de usabilidade.

## 13. Resultado e limitações

O resultado atual é uma aplicação web publicada que reúne informações sobre pontos de coleta e um mural de reaproveitamento de materiais. A solução demonstra funcionalidades de autenticação, persistência e manutenção de anúncios, além das melhorias registradas na PIT II.

O sistema **não apresenta um mapa geográfico interativo** na implementação examinada. Não há, nos materiais analisados, evidência suficiente para afirmar métricas de redução efetiva de resíduos, auditoria de segurança completa ou cobertura de testes automatizados.

## 14. Repositório e aplicação

- **Código-fonte:** https://github.com/Lucassg023/campus-consciente
- **Aplicação publicada:** https://campus-consciente.goncalveslucasnome11.workers.dev
- **Vídeo da solução inicial:** https://www.youtube.com/watch?v=zB-lUbWOf6c
- **Vídeo das melhorias:** https://www.youtube.com/watch?v=4_AL6lTG-L4