# Cidadão Fácil — Front-end (Angular)

> Global Solution FIAP 2026.2 · CitizenTech · Engenharia de Software · Equipe TechVerse

Interface web do **Cidadão Fácil**: o cidadão descreve o que precisa com as próprias palavras e recebe serviços públicos relacionados, com requisitos, documentos, passo a passo e link para o canal oficial.

## Ficha da CitizenTech

| Campo | Definição |
|---|---|
| Nome | Cidadão Fácil |
| Cidade e bairro | _preencher_ |
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
| `/servicos/:id` | Detalhe: requisitos, checklist de documentos, etapas, fonte | `GET /api/servicos/{id}` |
| `/salvos` | Serviços salvos neste aparelho | (local, sem servidor) |
| `/admin/servicos` | Lista e exclusão de serviços | `GET`, `DELETE /api/servicos` |
| `/admin/servicos/novo` e `/:id` | Cadastro/edição + requisitos, etapas e documentos | `POST`, `PUT /api/servicos`, `/requisitos`, `/etapas`, `/documentos` |
| `/admin/categorias` | CRUD de categorias | `GET`, `POST`, `PUT`, `DELETE /api/categorias` |
| `/admin/documentos` | CRUD de documentos | `GET`, `POST`, `PUT`, `DELETE /api/documentos` |
| `/admin/indicadores` | Indicador de impacto | `GET /api/assistente/indicadores` |

## Diretrizes de UX e acessibilidade aplicadas

- **Linguagem simples**: frases curtas, sem jargão; “pode ser relevante”, nunca “você tem direito”.
- **Transparência**: toda orientação mostra a fonte oficial e a data de verificação; dados antigos aparecem como “Informação em revisão”.
- **Honestidade**: quando não encontra nada, o assistente diz isso e oferece saídas (reescrever ou escolher um assunto).
- **Acessibilidade**: fonte *Atkinson Hyperlegible* (criada para baixa visão), contraste ≥ 4.5:1, modo **alto contraste**, **A+ / A-**, link “Pular para o conteúdo”, foco visível, alvos de toque ≥ 44 px, rótulos em todos os campos, mensagens de erro ligadas aos campos (`aria-describedby`), respostas do assistente anunciadas a leitores de tela (`aria-live`), respeito a “reduzir movimento”.
- **Mobile first**: todas as telas funcionam em 360 px.
- **Privacidade**: sem login, sem CPF, sem documentos. “Salvos” fica só no navegador.
- **Identidade**: paleta inspirada no padrão visual de serviços públicos digitais (azul institucional + amarelo), **sem usar marcas oficiais** e com aviso fixo de que não é um site do governo.

## Arquitetura

```
src/app/
├── core/
│   ├── api.ts                 # todas as chamadas HTTP à API Java
│   ├── models.ts              # tipos = DTOs da API
│   ├── preferencias.ts        # fonte e alto contraste
│   ├── salvos.ts              # serviços salvos (localStorage)
│   └── mock/                  # modo demonstração (API simulada no navegador)
├── shared/                    # ícones, carregando, erro, aviso oficial
└── pages/                     # uma pasta por tela (rotas com lazy loading)
```

Angular 22 · componentes standalone · signals · controle de fluxo `@if/@for` · Reactive Forms · OnPush.

## Como executar

Requisitos: **Node.js 22+** e npm.

```bash
npm install
npm start            # http://localhost:4200 — modo demonstração (sem API)
```

### Conectar na API Java
1. Rode a API (`cidadao-facil-api`) em `http://localhost:8080`.
2. Em `src/environments/environment.development.ts`, troque `useMock` para `false`.
3. `npm start`.

### Build de produção
```bash
npm run build                                   # usa a API em environment.ts (apiUrl)
npx ng build --configuration demo               # site que funciona sozinho (modo demonstração)
```
Saída em `dist/cidadao-facil-web/browser`.

> Antes do deploy, coloque o link real da API (Render) em `src/environments/environment.ts`.

### Deploy no Render (Static Site)
1. **New > Static Site** › conecte este repositório.
2. Build command: `npm ci && npm run build`
3. Publish directory: `dist/cidadao-facil-web/browser`
4. Em **Redirects/Rewrites**: `/*` → `/index.html` (Rewrite), para as rotas do Angular funcionarem ao recarregar a página.

Ou use o `render.yaml` da raiz (New > Blueprint).

## Integrantes

| Nome | RM |
|---|---|
| Davi Marques de Andrade Munhoz | 566223 |
| Diogo Oliveira Lima | 562559 |
| Leandro Simoneli da Silva | 566539 |
| Lucas dos Reis Aquino | 562414 |
| Lucas Perez Bonato | 565356 |
