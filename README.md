# Cidadão Fácil — Front-end (Angular)

> Global Solution FIAP 2026.2 · CitizenTech · Engenharia de Software · Equipe TechVerse

Interface web do **Cidadão Fácil**: o cidadão descreve o que precisa com as próprias palavras e recebe serviços públicos relacionados, com requisitos, documentos, passo a passo e link para o canal oficial.

## Links

| | Link |
|---|---|
| **Site publicado (front-end, Render)** | https://cidadao-facil-web.onrender.com |
| **Site publicado (front-end, Vercel)** | https://cidadao-facil-techverse.vercel.app |
| **API publicada (Java / Spring Boot)** | https://cidadao-facil-api-6hqm.onrender.com |
| **Swagger da API** | https://cidadao-facil-api-6hqm.onrender.com/swagger-ui.html |
| **Repositório da API** | https://github.com/TechVerseFiap/TechVerse.GS-2.BackEnd |

> O front está publicado no **Render** e no **Vercel** (mesmo código, mesma API) e a API fica no **Render**. No plano gratuito do Render, se a API estiver parada, a primeira busca pode levar cerca de 1 minuto. Para "acordar" antes de usar, abra https://cidadao-facil-api-6hqm.onrender.com/api/status e espere aparecer `"status":"online"`.

## Ficha da CitizenTech

| Campo | Definição |
|---|---|
| Nome | Cidadão Fácil |
| Cidadão beneficiado | Pessoas que procuram emprego, qualificação e serviços públicos, especialmente quem tem pouca familiaridade com portais do governo |
| Problema, em uma frase | Cidadãos têm dificuldade para encontrar, entender e acessar informações sobre serviços públicos, documentos, direitos e benefícios |
| Como funciona | Busca em linguagem natural → assistente consulta o catálogo → mostra serviços com justificativa, requisitos, documentos, etapas e fonte oficial |
| ODS conectados | 4, 8, 10 e 16 |

## Telas

| Rota | Tela | Endpoints usados |
|---|---|---|
| `/` | Início: pergunta livre, exemplos, categorias, destaques | `GET /api/categorias`, `GET /api/servicos` |
| `/assistente?q=` | Conversa com o assistente e recomendações | `POST /api/assistente/perguntas` |
| `/categorias/:id` | Serviços de uma categoria, com filtro | `GET /api/categorias/{id}`, `GET /api/servicos?categoria=` |
| `/servicos/:id` | Detalhe: órgão e esfera, requisitos, checklist de documentos (obrigatórios e “se aplicável”), etapas, atendimento presencial, fonte | `GET /api/servicos/{id}` |
| `/panorama?cidade=` | Panorama da cidade: busca entre os 645 municípios de SP e mostra população (IBGE), saldo de empregos (CAGED), Bolsa Família (CGU) e unidades do SUS (CNES), com fonte e período | `GET /api/municipios?busca=`, `GET /api/municipios/{codigoIbge}/panorama` |
| `/salvos` | Serviços salvos neste aparelho | (local, sem servidor) |
| `/login` | Entrada no painel da equipe (login simulado) | (local, sem servidor) |
| `/admin/servicos` | Lista e exclusão de serviços | `GET`, `DELETE /api/servicos` |
| `/admin/servicos/novo` e `/:id` | Cadastro/edição (com órgão responsável) + requisitos, etapas e documentos | `POST`, `PUT /api/servicos`, `GET /api/orgaos`, `/requisitos`, `/etapas`, `/documentos` |
| `/admin/categorias` | CRUD de categorias | `GET`, `POST`, `PUT`, `DELETE /api/categorias` |
| `/admin/orgaos` | CRUD de órgãos responsáveis (sigla e esfera) | `GET`, `POST`, `PUT`, `DELETE /api/orgaos` |
| `/admin/documentos` | CRUD de documentos | `GET`, `POST`, `PUT`, `DELETE /api/documentos` |
| `/admin/indicadores` | Indicador de impacto e atualização do panorama pela Base dos Dados | `GET /api/assistente/indicadores`, `GET`, `POST /api/sincronizacao` |

## Diretrizes de UX e acessibilidade aplicadas

- **Linguagem simples**: frases curtas, sem jargão; “pode ser relevante”, nunca “você tem direito”.
- **Transparência**: toda orientação mostra a fonte oficial e a data de verificação; dados antigos aparecem como “Informação em revisão”.
- **Honestidade**: quando não encontra nada, o assistente diz isso e oferece saídas (reescrever ou escolher um assunto).
- **Acessibilidade**: fonte *Atkinson Hyperlegible* (criada para baixa visão), contraste ≥ 4.5:1, modo **alto contraste**, **A+ / A-**, link “Pular para o conteúdo”, foco visível, alvos de toque ≥ 44 px, rótulos em todos os campos, mensagens de erro ligadas aos campos (`aria-describedby`), respostas do assistente anunciadas a leitores de tela (`aria-live`), respeito a “reduzir movimento”.
- **Mobile first de verdade**: o CSS base é o do celular e as telas maiores são acréscimos com `@media (min-width: 48rem)` (tablet) e `@media (min-width: 64rem)` (computador). As grades usam `minmax(min(100%, ...), 1fr)` para não estourar em telas de 320 px. No celular, o topo fica compacto (aviso em uma linha e opções de acessibilidade no botão **Aa**), a navegação fica numa barra fixa embaixo, como em aplicativos, o campo do assistente fica logo acima dela e as tabelas do painel viram cartões. Do tablet em diante aparecem o menu no topo, o menu lateral do painel e, no computador, a coluna lateral fixa no detalhe do serviço.
- **Dados públicos com contexto**: o panorama mostra só números agregados por município, sempre com fonte, período e o aviso de que não indicam direito a benefício.
- **Privacidade**: o cidadão não faz login nem informa CPF ou documentos. “Salvos” fica só no navegador. Só o painel da equipe pede login.
- **Identidade**: paleta inspirada no padrão visual de serviços públicos digitais (azul institucional + amarelo), **sem usar marcas oficiais** e com aviso fixo de que não é um site do governo.

## Acesso ao painel (login simulado)

O **Painel** (`/admin`) é a área da equipe que mantém o catálogo. Para entrar, use o RM de um integrante e a senha de demonstração:

| Integrante | Usuário (RM) | Senha |
|---|---|---|
| Davi Marques de Andrade Munhoz | `566223` | `techverse2026` |
| Diogo Oliveira Lima | `562559` | `techverse2026` |
| Leandro Simoneli da Silva | `566539` | `techverse2026` |
| Lucas dos Reis Aquino | `562414` | `techverse2026` |
| Lucas Perez Bonato | `565356` | `techverse2026` |

Como funciona:
- Qualquer rota `/admin/...` sem login leva para `/login`; depois de entrar, o usuário volta para a página que tinha pedido.
- A sessão fica no `sessionStorage`: dura enquanto a aba estiver aberta. O botão **Sair** encerra a sessão.
- Usuários e senha ficam em `src/app/core/autenticacao.ts`; a guarda de rota é `exigeLogin`.

> **Importante:** é um login **simulado**, só para demonstração do projeto acadêmico. A conferência acontece no navegador e a API continua aberta (o Swagger segue acessível para a avaliação). Em produção, o correto seria autenticação na API (por exemplo, Spring Security com token JWT). A senha é fictícia e não é senha real de ninguém.

## Arquitetura

```
src/app/
├── core/
│   ├── api.ts                 # todas as chamadas HTTP à API Java
│   ├── autenticacao.ts        # login simulado do painel + guarda de rota
│   ├── models.ts              # tipos = DTOs da API
│   ├── preferencias.ts        # fonte e alto contraste
│   └── salvos.ts              # serviços salvos (localStorage)
├── shared/                    # ícones, carregando, erro, aviso oficial
└── pages/                     # uma pasta por tela (rotas com lazy loading)
```

Angular 22 · componentes standalone · signals · controle de fluxo `@if/@for` · Reactive Forms · OnPush.

## Como executar

### Online (sem instalar nada)
Acesse https://cidadao-facil-web.onrender.com (ou https://cidadao-facil-techverse.vercel.app). O site chama a API publicada no Render, que lê o Oracle da FIAP e busca os indicadores do panorama na [Base dos Dados](https://basedosdados.org). Não existe modo de demonstração: tudo o que aparece vem da API.

Roteiro sugerido:
1. Na tela inicial, escreva *“estou desempregado e quero um curso gratuito”*.
2. Abra um dos serviços recomendados e marque os documentos no checklist.
3. Em **Sua cidade**, busque um município de SP e veja os indicadores com fonte e período.
4. Em **Painel**, entre com um RM da tabela acima e a senha `techverse2026`; veja a lista de serviços, edite um e, em **Indicadores**, clique em **Atualizar com a Base dos Dados**.
5. Teste **A+ / A-** e **Alto contraste** na barra do topo (no celular, pelo botão **Aa**).

### Localmente
Requisitos: **Node.js 22.22.3+** (ou 24.15+) e npm. O front precisa da API Java rodando.

1. Suba a API (repositório [TechVerse.GS-2.BackEnd](https://github.com/TechVerseFiap/TechVerse.GS-2.BackEnd)) em `http://localhost:8080`, por exemplo com o banco H2: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`.
2. No front:

```bash
npm install
npm start
```

| Comando | Resultado |
|---|---|
| `npm start` | `http://localhost:4200` ligado à **API local** (`http://localhost:8080/api`) |
| `npx ng serve --configuration production` | `http://localhost:4200` ligado à **API publicada no Render** |

### Ambientes

| Arquivo | Usado em | API |
|---|---|---|
| `environment.development.ts` | `npm start` | `http://localhost:8080/api` |
| `environment.ts` | `npm run build` (produção, Render e Vercel) | `https://cidadao-facil-api-6hqm.onrender.com/api` |

O build gera os arquivos em `dist/cidadao-facil-web/browser`.

### Deploy no Render (site estático)
Publicado em https://cidadao-facil-web.onrender.com (plano gratuito), com o mesmo `render.yaml` da raiz:

| Campo | Valor |
|---|---|
| Tipo | Static Site |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist/cidadao-facil-web/browser` |
| Variável `NODE_VERSION` | `24` (o Angular 22 exige Node 22.22.3+) |
| Rewrite | `/*` → `/index.html`, para as rotas do Angular funcionarem ao recarregar a página |

### Deploy no Vercel
O site está publicado em https://cidadao-facil-techverse.vercel.app (plano Hobby, gratuito). A configuração fica no `vercel.json` da raiz:

| Campo | Valor |
|---|---|
| Framework | Angular |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist/cidadao-facil-web/browser` |
| Rewrites | `/(.*)` → `/index.html`, para as rotas do Angular funcionarem ao recarregar a página |

Cada commit na branch `main` gera um novo deploy automaticamente. A API continua no Render (https://cidadao-facil-api-6hqm.onrender.com).

Para publicar uma cópia: em https://vercel.com, **Add New › Project**, importe este repositório e clique em **Deploy** (os campos acima já vêm do `vercel.json`).

## Integrantes

| Nome | RM |
|---|---|
| Davi Marques de Andrade Munhoz | 566223 |
| Diogo Oliveira Lima | 562559 |
| Leandro Simoneli da Silva | 566539 |
| Lucas dos Reis Aquino | 562414 |
| Lucas Perez Bonato | 565356 |
