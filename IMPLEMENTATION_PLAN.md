# Pet Studio — Plano Técnico de Implementação (Frontend / Fase 1)

> **Documento:** Plano de implementação técnico
> **Autor:** Frontend Lead
> **Data:** 2026-08-05
> **Escopo:** SPA frontend-only com persistência simulada. Sem backend nesta fase.
> **Referência visual:** [`example.png`](example.png) (raiz do repositório)

---

## 0. Resumo executivo e decisões de arquitetura

### 0.1 Contexto observado no repositório

O repositório `Pet-Studio-UI` está vazio (contém apenas `example.png`). Existe um diretório irmão **`Pet-Studio-Server/`, também vazio**. Isso é a informação mais importante para a arquitetura desta fase:

> **O backend é um item de roadmap, não um "talvez".** Portanto o `localStorage` **não** pode ser acessado diretamente pelos componentes. Toda persistência passa por uma camada de repositório assíncrona (`Promise`-based) cuja implementação é trocável. Na Fase 2, substitui-se `LocalStorageAdapter` por `HttpAdapter` **sem tocar em nenhum componente de UI**. Este é o requisito não-funcional número 1 do plano.

### 0.2 Premissas assumidas (confirmar, mas não bloqueiam o início)

| # | Premissa | Justificativa |
|---|---|---|
| A1 | Idioma da UI: **pt-BR** | O briefing usa "Banho/Tosa"; WhatsApp como canal primário; contexto Brasil/Sergipe |
| A2 | Fuso horário fixo: **America/Maceio (UTC−3)** | Estabelecimento físico único; evita a classe inteira de bugs de UTC (ver §3.4) |
| A3 | Telefone WhatsApp em formato **E.164 sem `+`** (`55DD9XXXXXXXX`) | Formato exigido por `wa.me` |
| A4 | Sem carrinho, checkout ou pagamento — **catálogo estritamente informativo** | Requisito explícito e crítico do briefing |
| A5 | Deploy em host estático (Vercel / Netlify / GitHub Pages) | SPA sem backend |

### 0.3 Stack — decisões e alternativas rejeitadas

| Camada | Escolha | Por quê | Rejeitado |
|---|---|---|---|
| Framework | **React 19** | Ecossistema de libs exigidas (Sonner, Radix, Lucide) é React-first | Vue/Svelte: viável, mas custo de integração maior com as libs pedidas |
| Build | **Vite 7** | HMR, `manualChunks` explícito, `vite-plugin-pwa` de primeira linha | Next.js — SSR/servidor é anti-requisito nesta fase |
| Linguagem | **TypeScript 5.x** em `strict` + `noUncheckedIndexedAccess` | Domínio com agendamento/datas exige tipagem forte | — |
| Estilo | **TailwindCSS v4** (`@tailwindcss/vite`) | Design tokens nativos via `@theme`; JIT sem `content` config | Tailwind v3 (config JS legado) |
| Rotas | **React Router v7** (modo biblioteca, `createBrowserRouter`) | `lazy()` por rota = code-splitting automático | TanStack Router (ótimo, mas curva maior) |
| Estado | **Zustand** + repositórios | Store pequena, sem boilerplate, `subscribeWithSelector` para sync entre abas | Redux Toolkit (excessivo); Context puro (re-renders) |
| Validação | **Zod 4** | `localStorage` é entrada **não confiável** (ver §3.3) | — |
| Formulários | **react-hook-form** + `@hookform/resolvers/zod` | Uncontrolled = menos re-render no form de agendamento | Formik |
| Datas | **date-fns 4** + `@date-fns/tz` | Tree-shakeable; base do react-day-picker | Moment (deprecado), Day.js (menos tipado) |
| Calendário | **react-day-picker v9** | Headless-friendly, estiliza 100% com Tailwind, a11y correta | Construir do zero (risco de a11y) |
| Ícones | **lucide-react** + sprite SVG custom | Requisito. Lacunas cobertas por sprite (ver §2.4) | — |
| Toasts | **Sonner** | Requisito. Fila, swipe-to-dismiss, `richColors` | react-hot-toast |
| Modais | **Radix UI `Dialog`** | Focus trap, `aria-modal`, `Esc`, scroll-lock — a11y de graça | Modal manual (risco alto de a11y) |
| Animação | **`motion`** (sucessor do framer-motion) | `AnimatePresence` p/ transição de página; `LazyMotion` p/ bundle | GSAP (peso/licença) |
| Mapa | **Leaflet + react-leaflet** | Sem chave de API, sem custo, sem tracker de terceiros | Google Maps iframe (cookies de terceiros + LCP ruim) |
| PWA | **vite-plugin-pwa** (Workbox) | Gera manifest + SW; `injectManifest` p/ controle | SW manual |
| Testes | **Vitest + RTL**, **Playwright** (Chromium + WebKit) | WebKit do Playwright cobre o requisito Safari em CI | Cypress (sem WebKit real) |

### 0.4 Aviso técnico obrigatório — autenticação simulada

O painel `/admin` é protegido por login **simulado no cliente**. Deixando explícito, porque isso precisa constar na documentação do projeto:

- **Isto não é segurança.** Qualquer pessoa com DevTools acessa a rota, lê e edita os dados.
- Portanto: **nenhuma credencial real** no código; as credenciais de demo (`admin` / `petstudio`) ficam em `.env` (`VITE_DEMO_*`) e são exibidas na própria tela de login como "acesso de demonstração".
- **Nenhum dado pessoal real** (telefone de tutor real, etc.) pode ser usado no seed. Todos os mocks são fictícios.
- Um banner discreto no painel indica "Ambiente de demonstração — dados locais".
- A Fase 2 substitui isso por sessão real no `Pet-Studio-Server`. O `AuthRepository` já nasce com a mesma assinatura que a implementação HTTP terá.

---

## 1. Fase 0 — Fundação do projeto

**Objetivo:** repositório executável, com qualidade automatizada, antes de qualquer feature.

### 1.1 Scaffold

```bash
npm create vite@latest . -- --template react-ts
```

```bash
npm i react-router zustand zod react-hook-form @hookform/resolvers date-fns react-day-picker lucide-react sonner motion leaflet react-leaflet radix-ui clsx tailwind-merge
```

```bash
npm i -D tailwindcss @tailwindcss/vite vite-plugin-pwa @types/leaflet vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test eslint prettier prettier-plugin-tailwindcss vite-bundle-visualizer @lhci/cli sharp
```

### 1.2 Estrutura de diretórios

Organização **por feature**, não por tipo de arquivo. Cada feature é auto-contida e recortável para lazy-loading.

```
src/
├── app/
│   ├── router.tsx              # createBrowserRouter + lazy() por rota
│   ├── providers.tsx           # Toaster, ErrorBoundary, MotionConfig
│   └── layouts/
│       ├── PublicLayout.tsx    # Header + Outlet + Footer + WhatsAppFab
│       └── AdminLayout.tsx     # Sidebar + Outlet + guard
├── design-system/
│   ├── tokens.css              # @theme — fonte única de verdade visual
│   ├── primitives/             # Button, Card, Badge, Input, Select, Modal, Table
│   ├── motion/                 # FloatingObject, PageTransition, variants.ts
│   └── decorative/             # WavyDivider, PaperEdge, sprite.svg
├── domain/
│   ├── types.ts                # Tipos do domínio (sem dependência de infra)
│   ├── schemas.ts              # Espelhos Zod dos tipos
│   └── availability.ts         # Motor de slots — LÓGICA PURA, 100% testada
├── data/
│   ├── ports.ts                # Interfaces de repositório
│   ├── storage/
│   │   ├── driver.ts           # Wrapper localStorage + tratamento de erro
│   │   ├── migrations.ts       # Versionamento de schema
│   │   └── seed.ts
│   ├── repositories/           # ProductRepo, BookingRepo, AvailabilityRepo, AuthRepo
│   └── http/                   # (Fase 2) stubs vazios
├── features/
│   ├── home/  shop/  grooming/  clinic/  gallery/
│   └── admin/{auth,products,bookings,calendar}/
├── lib/
│   ├── whatsapp.ts             # Construtor de deep-link + templates
│   ├── datetime.ts             # Helpers de data com TZ fixo
│   ├── cn.ts                   # clsx + tailwind-merge
│   └── analytics.ts            # no-op nesta fase
├── config/site.ts              # Telefone, horários, Instagram, coordenadas
└── pwa/                        # useInstallPrompt, InstallButton
```

### 1.3 Portões de qualidade (configurar agora, não depois)

- **ESLint flat config**: `react-hooks`, `jsx-a11y`, `@typescript-eslint`.
- **Regra de import proibido** — impede o vazamento da infra para a UI:

```js
// eslint.config.js — regra que sustenta a decisão 0.1
{
  files: ['src/features/**', 'src/design-system/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['**/data/storage/**'], message: 'UI acessa dados apenas via data/repositories.' }
      ]
    }],
    'no-restricted-globals': [
      'error',
      { name: 'localStorage', message: 'Use o repositório correspondente.' }
    ],
  }
}
```

- **Prettier** com `prettier-plugin-tailwindcss` (ordena classes).
- **Orçamentos de bundle** já no CI desde o dia 1 (ver §9.2). Um teto criado no fim do projeto nunca é respeitado.
- **`tsconfig`**: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, alias `@/*`.

### 1.4 Critério de saída da Fase 0
- [ ] `npm run dev`, `build`, `lint`, `test`, `e2e` verdes
- [ ] CI (GitHub Actions) rodando lint + typecheck + unit + build em cada push
- [ ] Deploy de preview automático funcionando

---

## 2. Fase 1 — Design System (derivado de `example.png`)

**Objetivo:** consistência global. Nenhuma página é construída antes disso, senão cada tela reinventa espaçamento e cor.

### 2.1 Tokens extraídos da referência

A referência define uma linguagem clara: **amarelo mostra saturado** como cor de bloco (nunca de texto), **creme** como fundo, **teal** como ação, **carvão** para seções de contraste, bordas de papel rasgado entre seções e **ossos flutuantes** dispersos no hero.

```css
/* src/design-system/tokens.css */
@import "tailwindcss";

@theme {
  /* Marca — amostrados de example.png */
  --color-amber-brand: #f0b21d;   /* hero, blocos de destaque */
  --color-amber-soft:  #f8d987;   /* hovers, fundos de badge */
  --color-cream:       #faf7f0;   /* fundo padrão do site */
  --color-cream-deep:  #f2ede1;   /* faixas alternadas */
  --color-teal:        #45c0b4;   /* CTA primário */
  --color-teal-deep:   #2f9e94;   /* hover do CTA */
  --color-charcoal:    #2b2a28;   /* texto e seções escuras */
  --color-muted:       #7a736b;   /* texto secundário */

  /* Semânticos (micro-interações do briefing) */
  --color-urgent:      #e04f39;   /* "Urgente" — Clínica */
  --color-sale:        #e0447c;   /* "Promoção" — Loja */
  --color-success:     #3f9b6d;   /* "Concluído" */

  /* Tipografia */
  --font-display: "Baloo 2", system-ui, sans-serif;  /* títulos arredondados */
  --font-body:    "Nunito Sans", system-ui, sans-serif;
  --font-script:  "Caveat", cursive;                 /* logo / acentos */

  /* Movimento */
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-page: 320ms;
}
```

**Restrição de acessibilidade que precisa ser regra escrita:** `--color-amber-brand` sobre `--color-cream` tem contraste ≈ 1.7:1 — **reprovado em WCAG AA**. Regra do design system:

- ✅ Carvão sobre âmbar (bloco amarelo com texto escuro) — como na referência
- ✅ Âmbar como preenchimento de ícone/forma decorativa
- ❌ Texto âmbar sobre creme/branco em qualquer tamanho de corpo
- Destaque "Promoção"/"Urgente" usa `--color-sale` / `--color-urgent` sobre fundo claro (contraste verificado) ou texto branco sobre o pill preenchido.

### 2.2 Tipografia e carregamento de fonte

- 3 famílias, **self-hosted** em `woff2` (sem Google Fonts CDN: elimina requisição de terceiros, melhora LCP e evita questões de privacidade).
- Subset latin + latin-ext via `glyphhanger`/`subfont`.
- `@font-face` com `font-display: swap` e `<link rel="preload">` **apenas** para a `--font-display` weight 700 (a do LCP).
- `size-adjust` na fonte fallback para minimizar CLS na troca.

### 2.3 Primitivos

| Componente | Notas de implementação |
|---|---|
| `Button` | Variants: `primary` (teal pill), `secondary` (outline carvão), `ghost`, `danger`. Pill total (`rounded-full`) como na referência. `loading` com spinner e `aria-busy`. |
| `Card` | Fundo branco, `rounded-2xl`, sombra suave; hover eleva 4px + escala 1.02 (referência: card central da Shop destacado) |
| `Badge` | `sale`, `urgent`, `out-of-stock`, `new` — cor + peso tipográfico distintos (requisito de micro-interação) |
| `Modal` | Wrapper sobre Radix Dialog + animação de entrada |
| `Input`/`Select`/`Textarea` | Estados de erro conectados ao react-hook-form; `aria-describedby` no erro |
| `DataTable` | Admin. Em <768px **colapsa para cards empilhados** — tabela com scroll horizontal em mobile é uma armadilha de UX |
| `EmptyState` | Ilustração + CTA; usado em busca sem resultado, agenda vazia |
| `Skeleton` | Placeholders com dimensão fixa (previne CLS) |

### 2.4 Ícones — requisito de tema animal e a lacuna do Lucide

O Lucide cobre boa parte: `Dog`, `Cat`, `Bone`, `PawPrint`, `Fish`, `Bird`, `Rabbit`, `Turtle`, `Syringe`, `Stethoscope`, `Scissors`, `Bath`, `HeartPulse`.

**Não cobre** itens específicos deste projeto — notavelmente **novelo de lã**, tosquiadeira, ração/petisco em formato de osso, coleira. Plano:

1. Importar sempre **nomeadamente** (`import { Dog } from 'lucide-react'`) para tree-shaking. Nunca `import * as icons`.
2. Criar `src/design-system/decorative/sprite.svg` — sprite SVG único com os ícones custom (novelo, coleira, tosquiadeira, osso decorativo, patinha estilizada), consumido via `<use href="/sprite.svg#yarn" />`. Uma requisição, cacheável, sem custo de bundle JS.
3. `<Icon name="..." />` unifica as duas fontes atrás de uma única API.

### 2.5 Objetos flutuantes animados (requisito de micro-interação)

Componente `<FloatingObject>` — o elemento visual assinatura da referência (ossos espalhados no hero).

```tsx
// src/design-system/motion/FloatingObject.tsx
type Props = {
  shape: 'bone' | 'yarn' | 'paw' | 'fish' | 'feather';
  /** posição em % do container — permite composições declarativas */
  top: string; left: string;
  size?: number;      // px
  delay?: number;     // dessincroniza instâncias
  drift?: number;     // amplitude vertical em px (default 14)
  rotate?: number;    // amplitude de rotação em graus (default 8)
};
```

Implementação e regras:

- **CSS puro (`@keyframes` + `animation-delay`)**, não JS. Objetos decorativos não devem consumir main thread. `motion` fica reservado para transições de página e gestos.
- Anima **apenas `transform`** (`translate3d` + `rotate`). Nunca `top`/`left` — força layout a 60fps.
- `will-change: transform` aplicado com parcimônia (só nos elementos animados, no máx. ~6 por viewport).
- `aria-hidden="true"` + `pointer-events-none` em todos — são ruído para leitor de tela.
- **`prefers-reduced-motion: reduce` → objetos ficam estáticos** (visíveis, sem movimento). Implementado globalmente:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- **Colocação por contexto semântico** (requisito literal): ossos na Home/Loja canina, novelos na seção de gatos, patinhas na Clínica, penas/bolhas no Banho & Tosa.
- Em viewport <640px, renderizar no máximo **2** objetos (orçamento de performance mobile).

### 2.6 Divisores de papel rasgado

A referência separa seções com borda ondulada/serrilhada. Implementação: **SVG inline** (não imagem) com `preserveAspectRatio="none"`, `fill` herdado da cor da seção seguinte via `currentColor`. Componente `<WavyDivider variant="scallop" | "torn" flip />`. Custo: ~400 bytes, escala perfeitamente, muda de cor com o tema.

### 2.7 Transições entre páginas

```tsx
// AnimatePresence mode="wait" no PublicLayout, chaveado por location.pathname
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
```

- `<LazyMotion features={domAnimation} strict>` + componentes `m.*` → economiza ~20 KB frente ao import completo de `motion`.
- `<MotionConfig reducedMotion="user">` respeita a preferência do SO globalmente.
- Restaurar scroll para o topo na troca de rota (`ScrollRestoration` do React Router).

### 2.8 Critério de saída da Fase 2
- [ ] Storybook **ou** rota `/dev/kitchen-sink` renderizando todos os primitivos e estados
- [ ] Contraste auditado: 0 violações AA em texto
- [ ] Modo de movimento reduzido verificado manualmente

---

## 3. Fase 2 — Camada de domínio e persistência simulada

**Esta é a fase de maior risco técnico do projeto.** Agendamento, disponibilidade e datas concentram os bugs.

### 3.1 Modelo de domínio

```ts
// src/domain/types.ts
export type AnimalType = 'dog' | 'cat';
export type ItemType   = 'food' | 'toys' | 'hygiene';

/** 'yyyy-MM-dd' — data LOCAL, nunca um Date serializado. Ver §3.4 */
export type IsoDate = string;
/** 'HH:mm' em 24h */
export type TimeSlot = string;

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;          // inteiro. NUNCA float para dinheiro.
  itemType: ItemType;
  animalType: AnimalType | 'both';
  imageUrl: string;
  inStock: boolean;
  sale: { active: boolean; percentOff: number } | null;
  createdAt: string;           // ISO 8601 UTC
  updatedAt: string;
}

export type BookingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface GroomingBooking {
  id: string;
  petName: string;
  animalType: AnimalType;
  tutorName: string;
  tutorWhatsapp: string;       // '55DD9XXXXXXXX'
  notes: string;               // alergias, preferência de tosa
  date: IsoDate;
  time: TimeSlot;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ServiceKind = 'grooming' | 'clinic';

/** Modelo em duas camadas: template semanal + exceções por data. */
export interface WeeklyTemplate {
  service: ServiceKind;
  /** 0=domingo … 6=sábado */
  slotsByWeekday: Record<number, TimeSlot[]>;
}

export interface DateOverride {
  service: ServiceKind;
  date: IsoDate;
  closed: boolean;             // feriado / fechado
  slots: TimeSlot[] | null;    // null = herda o template
}
```

**Por que template + override** e não uma lista bruta de slots por data: o admin edita "as terças passam a abrir às 8h" **uma vez**, e não 52 vezes. Overrides cobrem feriados e exceções pontuais. É o mesmo modelo que qualquer backend de agenda usaria — o que torna a migração para a Fase 2 direta.

### 3.2 Motor de disponibilidade (lógica pura)

```ts
// src/domain/availability.ts — sem I/O, sem React. 100% testável.
export function resolveSlots(
  date: IsoDate,
  template: WeeklyTemplate,
  overrides: DateOverride[],
  bookings: GroomingBooking[],
  now: Date,
): { time: TimeSlot; state: 'free' | 'booked' | 'past' }[]
```

Regras, em ordem:
1. Override com `closed: true` → dia sem slots.
2. Override com `slots !== null` → substitui o template naquele dia.
3. Caso contrário → `template.slotsByWeekday[getDay(date)]`.
4. Slot com booking `status === 'scheduled'` no mesmo `(date, time)` → `booked`.
5. Slot no passado (comparado a `now` no fuso da premissa A2) → `past`.
6. Nunca permitir agendamento além de `MAX_ADVANCE_DAYS` (60) nem no mesmo dia com menos de `MIN_LEAD_HOURS` (2) de antecedência.

**Índice de demanda da Clínica** (calendário somente-visualização):
`ocupação = booked / total` → `livre` (<0.4) · `moderado` (0.4–0.75) · `alta demanda` (>0.75) · `fechado`. Como a clínica não tem agendamento na tela, a ocupação vem de um campo `demandLevel` editável direto pelo admin **ou** de bookings mock — decisão: **campo editável pelo admin**, é o que o requisito descreve ("o admin edita a disponibilidade da clínica").

### 3.3 `localStorage` é entrada não confiável

O usuário pode editar o `localStorage` à mão, uma versão anterior do app pode ter gravado outro formato, ou o valor pode estar truncado. **Todo `JSON.parse` passa por Zod antes de virar estado.**

```ts
// src/data/storage/driver.ts
export function readCollection<T>(key: string, schema: z.ZodType<T[]>): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn(`[storage] dados inválidos em "${key}", restaurando seed`, parsed.error);
      return [];                       // fallback silencioso p/ o usuário, log p/ o dev
    }
    return parsed.data;
  } catch {
    return [];
  }
}
```

Tratar também:
- **`QuotaExceededError`** — Safari em modo privado historicamente lança quota 0. `write()` captura e emite toast: *"Não foi possível salvar localmente."* O app continua funcionando em memória.
- **`localStorage` inacessível** (iframe cross-origin, cookies bloqueados) — `isStorageAvailable()` testa na inicialização; se falhar, cai para um `MemoryAdapter` com o mesmo contrato. O app **nunca** quebra por causa de storage.

### 3.4 Datas — a armadilha a evitar

`new Date('2026-08-10')` é interpretado como **UTC meia-noite**; em UTC−3 isso vira **09/08 21:00**, e o agendamento aparece no dia anterior. Regras não negociáveis:

- Datas de agenda são armazenadas como **string `'yyyy-MM-dd'`**, jamais como `Date` serializado ou timestamp.
- Toda conversão passa por `src/lib/datetime.ts` (`parseLocalDate`, `formatDisplay`, `nowInBusinessTz`).
- `now` é **sempre injetado** nas funções puras — nunca `new Date()` dentro da lógica. Isso torna os testes determinísticos.
- Teste unitário obrigatório rodando com `TZ=America/Maceio`, `TZ=UTC` e `TZ=Asia/Tokyo` — se passar nos três, o modelo está correto.

### 3.5 Versionamento e migração

```
petstudio:v1:products
petstudio:v1:bookings
petstudio:v1:availability
petstudio:v1:session
petstudio:schema-version
```

`runMigrations()` roda antes do primeiro render: compara `schema-version` com `CURRENT_VERSION`, aplica migrações em cadeia, e em caso de falha limpa o namespace e re-semeia. Evita o clássico "usuário com dados de duas semanas atrás quebra a build nova".

### 3.6 Contrato de repositório (a fronteira que permite trocar o backend)

```ts
// src/data/ports.ts — o que a UI enxerga. Assíncrono desde o dia 1.
export interface ProductRepository {
  list(filter?: ProductFilter): Promise<Product[]>;
  create(input: NewProduct): Promise<Product>;
  update(id: string, patch: Partial<Product>): Promise<Product>;
  remove(id: string): Promise<void>;
}

export interface BookingRepository {
  list(range?: { from: IsoDate; to: IsoDate }): Promise<GroomingBooking[]>;
  create(input: NewBooking): Promise<Result<GroomingBooking, 'SLOT_TAKEN' | 'SLOT_INVALID'>>;
  reschedule(id: string, date: IsoDate, time: TimeSlot): Promise<Result<GroomingBooking, 'SLOT_TAKEN'>>;
  setStatus(id: string, status: BookingStatus): Promise<GroomingBooking>;
}
```

Pontos deliberados:
- **`Promise` mesmo sendo síncrono.** Os componentes já lidam com `loading`/`error`; trocar para HTTP não muda uma linha de UI.
- **Latência artificial** de 150–350ms via `SIMULATED_LATENCY` (env). Sem isso, skeletons e estados de loading nunca são exercitados e quebram na primeira integração real.
- **`create` re-valida o slot no momento da escrita**, não só no submit — protege contra duas abas abertas.
- `Result<T, E>` explícito em vez de `throw` para erros de negócio previsíveis.

### 3.7 Sincronia entre abas

Listener do evento `storage` (dispara em *outras* abas) → re-hidrata a store Zustand. Efeito demonstrável: admin marca "concluído" numa aba, a aba pública reflete na hora. É um detalhe pequeno que vende bem a simulação.

### 3.8 Seed

~24 produtos (8 por `itemType`, distribuídos entre cão/gato), ~15 agendamentos (passados, hoje e futuros, cobrindo os 3 status), template semanal completo, 2 overrides de feriado. Nomes e telefones **fictícios** (faixa `5599...` reservada para exemplos).

### 3.9 Critério de saída da Fase 2
- [ ] `availability.ts` com cobertura ≥95% e testes nos 3 fusos
- [ ] Repositórios testados contra o adapter em memória
- [ ] "Botão de pânico" `resetDemoData()` no admin

---

## 4. Fase 3 — App shell e elementos globais

### 4.1 Rotas

| Rota | Componente | Estratégia |
|---|---|---|
| `/` | Home | **Eager** (é o LCP) |
| `/loja` | Shop | `lazy()` |
| `/banho-e-tosa` | Grooming | `lazy()` |
| `/clinica` | Clinic | `lazy()` |
| `/galeria` | Gallery | `lazy()` |
| `/admin/login` | AdminLogin | `lazy()` |
| `/admin/*` | Admin (guard) | `lazy()` — chunk único separado |
| `*` | NotFound | `lazy()` |

**Todo o `/admin` é um único chunk isolado.** O visitante público nunca baixa o código do painel. Esse é o maior ganho isolado de bundle do projeto.

**Prefetch em hover** nos links do header (`link.preload()`) — a navegação parece instantânea sem custo de carga inicial.

**Deploy estático:** exige rewrite `/* → /index.html` (`vercel.json`, `_redirects`, ou `404.html` no GitHub Pages). Sem isso, F5 em `/loja` retorna 404.

### 4.2 Botão flutuante de WhatsApp (todas as páginas)

- Fixo em `bottom-right`, `z-40`, com `env(safe-area-inset-bottom)` — sem isso fica sob a barra do Safari iOS.
- Discreto: 52px, ícone + halo suave; expande para pill com rótulo no hover em desktop.
- Entra com `scale` após ~600ms para não competir com o LCP.
- Não colide com o toaster (Sonner posicionado em `top-right`) nem com o modal de confirmação (`z-50`).
- `aria-label="Falar no WhatsApp"`, `rel="noopener noreferrer"`, `target="_blank"`.

### 4.3 Construtor de deep-link do WhatsApp

Centralizado — mensagem montada em um único lugar, nunca espalhada por componentes.

```ts
// src/lib/whatsapp.ts
const templates = {
  clinicConsult: (p: { pet?: string }) =>
    `Olá! Gostaria de agendar uma *consulta veterinária*${p.pet ? ` para o(a) ${p.pet}` : ''}. ` +
    `Poderiam me informar os horários disponíveis?`,

  bookingConfirm: (p: { tutor: string; pet: string; date: string; time: string }) =>
    `Olá, ${p.tutor}! 🐾\n\nEstamos *confirmando* o banho e tosa do(a) *${p.pet}*:\n` +
    `📅 ${p.date}\n🕐 ${p.time}\n\nPodemos confirmar?`,

  bookingReschedule: (p: { tutor: string; pet: string; date: string; time: string }) =>
    `Olá, ${p.tutor}! Precisamos *reagendar* o horário do(a) *${p.pet}*. ` +
    `A nova sugestão é ${p.date} às ${p.time}. Fica bom para você?`,

  bookingCancel: (p: { tutor: string; pet: string; date: string }) =>
    `Olá, ${p.tutor}. Infelizmente precisamos *cancelar* o agendamento do(a) *${p.pet}* em ${p.date}. ` +
    `Podemos remarcar?`,

  bookingDone: (p: { tutor: string; pet: string }) =>
    `Olá, ${p.tutor}! O(A) *${p.pet}* está pronto(a) e cheiroso(a)! 🛁✨ Pode vir buscar.`,
} as const;

export function buildWhatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
```

Notas de implementação:
- `wa.me` (não `api.whatsapp.com`) — trata desktop/mobile automaticamente.
- `*asterisco*` = negrito no WhatsApp; `\n` funciona após `encodeURIComponent`. É assim que se atende "mensagem estilizada".
- Emojis são seguros com `encodeURIComponent`.
- **Nunca** usar `window.open()` em callback assíncrono — o bloqueador de pop-up do Safari mata. Sempre `<a href>` ou `window.open` **síncrono** no handler do clique.

### 4.4 Notificações (Sonner)

`<Toaster position="top-right" richColors closeButton expand={false} />`, com wrapper `notify.success/error/info` para padronizar copy e ícones. Eventos cobertos: agendamento confirmado, agendamento cancelado, produto criado/editado/removido, promoção aplicada, configurações salvas, falha de storage, login inválido.

### 4.5 Error boundary

`ErrorBoundary` de rota (React Router `errorElement`) com fallback ilustrado ("Ops, esse osso a gente não achou") + botão de recarregar + `resetDemoData()`. Um erro em `/loja` não pode derrubar o site inteiro.

---

## 5. Fase 4 — Páginas públicas

### 5.1 Home ("Quem somos")

Composição, seguindo a referência:
1. **Hero** — bloco âmbar de largura total, foto do pet recortada, ossos flutuantes, borda ondulada inferior. Título em `--font-display`.
2. **Sobre** — texto centralizado + CTA teal em pill.
3. **Faixa de 4 serviços** — ícones em linha (Clínica · Banho & Tosa · Hotel · Loja), com link para as respectivas rotas.
4. **Informações práticas** — telefone (`tel:`), horário com **indicador ao vivo "Aberto agora / Fechado"** calculado a partir de `config/site.ts` e do fuso da premissa A2, link do Instagram.
5. **Mapa (Leaflet)** — ver abaixo.
6. **Faixa carvão** de depoimento (como na referência).

**Estratégia do mapa — decisão de performance:** Leaflet + tiles pesam ~150 KB e disparam requisições a terceiros. Renderizar **uma imagem estática do mapa com um overlay "Ver mapa interativo"**; o Leaflet só é `import()`-ado no clique. Ganho direto no LCP e no tempo de bloqueio da Home. Um link "Traçar rota" (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`) atende quem só quer navegar.

**Imagem do hero — regras de LCP:**
- AVIF + WebP + JPEG via `<picture>`, `srcset` em 640/960/1280/1920
- `fetchpriority="high"`, `loading="eager"`, `decoding="async"`
- `width`/`height` explícitos (CLS = 0)
- `<link rel="preload" as="image" imagesrcset=...>` no `index.html`

### 5.2 Loja — catálogo somente-visualização

> **Restrição crítica reafirmada:** sem carrinho, sem checkout, sem pagamento. Nenhum componente com verbo de compra. O CTA de cada card é **"Consultar no WhatsApp"** (deep-link com nome do produto), não "Comprar".

- **Filtros:** `itemType` (chips múltiplos), `animalType` (cão/gato/ambos), busca livre com **debounce de 250ms**, ordenação (relevância, menor/maior preço, nome), e toggles "só disponíveis" / "só promoções".
- **Estado dos filtros na URL** (`useSearchParams`): `/loja?tipo=food&animal=dog&q=racao`. Filtro compartilhável, botão voltar funciona, e o estado sobrevive ao F5. É o detalhe que separa um protótipo de um produto.
- **Busca:** normalizar acentos (`normalize('NFD').replace(/\p{Diacritic}/gu,'')`) — "racao" precisa achar "ração". Requisito não escrito, mas obrigatório em pt-BR.
- **Micro-interações do briefing:** badge **"PROMOÇÃO"** em `--color-sale`, peso 800, leve rotação, com preço antigo riscado e o novo em destaque. Card esgotado fica dessaturado (`grayscale`) com faixa "ESGOTADO".
- Grid responsivo 1/2/3/4 colunas. **`content-visibility: auto`** nos cards fora da viewport.
- `EmptyState` com sugestão de limpar filtros quando não há resultado.
- Se o catálogo crescer além de ~60 itens, paginar client-side (não virtualizar — complexidade desnecessária nesta escala).

### 5.3 Banho & Tosa — agendamento

Fluxo em 3 passos (um formulário, revelação progressiva — reduz abandono no mobile):

**Passo 1 — Pet e tutor**
| Campo | Validação (Zod) |
|---|---|
| Tipo de animal | enum `dog`/`cat`, obrigatório, seletor visual com ícone |
| Nome do pet | 2–40 chars |
| Nome do tutor | 2–60 chars |
| WhatsApp | máscara `(99) 99999-9999`, regex BR, `inputMode="tel"` |
| Observações | opcional, ≤500 chars, com contador (alergias, estilo de tosa) |

**Passo 2 — Calendário e horário**
- `react-day-picker` com `disabled`: dias passados, dias além de 60, dias fechados por override.
- Modificadores visuais: dia lotado (âmbar suave), dia com poucos horários, dia fechado (riscado).
- Ao selecionar o dia, `resolveSlots()` monta a grade de horários; slot ocupado fica desabilitado com `aria-label="14:00 — indisponível"`.
- Estado de loading real (latência simulada) → skeleton dos slots.

**Passo 3 — Modal de confirmação (requisito explícito)**
- Radix Dialog com resumo completo: pet, tipo, tutor, WhatsApp, data por extenso ("segunda, 10 de agosto"), horário, observações.
- Botões: **"Voltar e editar"** / **"Confirmar agendamento"** (loading + disabled durante o envio).
- **Revalidação do slot no momento do confirmar.** Se ficou indisponível: toast de erro, modal fecha, calendário recarrega e o slot conflitante é destacado.
- Sucesso: `notify.success('Agendamento confirmado!')`, animação de patinha, tela de sucesso com **botão "Enviar confirmação no WhatsApp"** e opção de adicionar ao calendário (`.ics` gerado no cliente — 30 linhas, alto valor percebido).

**Proteção contra duplo envio:** botão desabilitado + guarda por chave idempotente `${date}|${time}|${whatsapp}` no repositório.

### 5.4 Clínica — informativo, sem agendamento

- Lista de serviços em cards com ícone (consulta, vacinação, exames, cirurgia, emergência).
- **Micro-interação "Urgente":** o card de emergência usa `--color-urgent`, peso tipográfico maior e um pulso sutil no ícone (`animation` desligada em reduced-motion).
- **Calendário somente-visualização:** mesmo `react-day-picker`, **`mode` sem seleção**, `onSelect` ausente, dias pintados pelo `demandLevel` com legenda ("Livre · Moderado · Alta demanda · Fechado"). Precisa ficar visualmente óbvio que **não é clicável** — cursor default, sem hover state, nota "Consulte pelo WhatsApp para agendar".
- **CTA "Agendar Consulta"** proeminente → `buildWhatsappUrl(SITE.whatsapp, templates.clinicConsult({}))`.

### 5.5 Galeria

- Grid masonry via CSS (`columns-2 md:columns-3 lg:columns-4`) — zero JS.
- `loading="lazy"` + `decoding="async"` em tudo **exceto** as 4 primeiras imagens.
- Placeholder LQIP (base64 ~20px) com blur-up, dimensões reservadas → CLS 0.
- Lightbox: Radix Dialog, navegação por `←/→`, `Esc`, swipe no mobile; imagem em alta resolução `import()`-ada sob demanda.
- Filtro cão/gato.
- `alt` descritivo real em cada foto (não "imagem1.jpg").

---

## 6. Fase 5 — Painel administrativo

### 6.1 Autenticação simulada

- `/admin/login`: usuário + senha, validação Zod, mensagem de erro genérica, delay artificial de 600ms (evita a sensação de "botão quebrado").
- Sessão: `{ user, expiresAt }` em `localStorage`, TTL de 8h.
- `<RequireAuth>` envolve `/admin/*`, redireciona para login preservando `?from=`.
- Banner permanente: **"Ambiente de demonstração — dados salvos apenas neste navegador."**
- Ver o aviso de segurança em §0.4.

### 6.2 Dashboard

Cards de resumo: agendamentos de hoje, próximos 7 dias, produtos esgotados, promoções ativas. Cada card leva à listagem filtrada correspondente.

### 6.3 Gestão da Loja (CRUD completo)

| Ação | Detalhe |
|---|---|
| Listar | `DataTable` com busca, filtro por tipo/animal/estoque, ordenação; colapsa em cards <768px |
| Criar | Modal com formulário; imagem por **URL** (sem upload — não há backend); preview ao vivo |
| Editar | Mesmo formulário pré-preenchido |
| Excluir | **Confirmação obrigatória** com o nome do produto no texto + toast com "Desfazer" (janela de 5s) |
| Esgotado | Toggle inline, salva imediato, toast |
| Promoção | Toggle + percentual (1–90), preview do preço final calculado |
| Ações em lote | Seleção múltipla → esgotar/remover promoção em massa |

Preço editado em reais (`R$ 89,90`) e persistido em centavos (`8990`) — conversão isolada em `lib/money.ts`, com testes. Formatação de exibição via `Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' })`.

### 6.4 Gestão de Banho & Tosa

Tabela com filtros por status/período/animal e busca por pet ou tutor. Agrupamento por dia, destacando "Hoje".

**Ações por agendamento — todas abrindo o WhatsApp com mensagem pronta (§4.3):**

| Ação | Comportamento |
|---|---|
| **Contatar tutor** | Abre WhatsApp com `bookingConfirm` |
| **Cancelar** | Modal de confirmação → status `cancelled`, libera o slot → oferece abrir WhatsApp com `bookingCancel` |
| **Alterar data/hora** | Modal com o mesmo calendário do público, validando disponibilidade → abre WhatsApp com `bookingReschedule` |
| **Marcar como concluído** | Status `completed` (badge verde) → oferece WhatsApp com `bookingDone` |

Padrão de UX importante: **primeiro persiste a mudança, depois oferece o WhatsApp** — em um segundo passo, nunca automaticamente. Abrir uma aba nova sem o usuário pedir é hostil, e um pop-up bloqueado faria parecer que a ação falhou.

### 6.5 Edição de calendário/disponibilidade

Tela única com abas **Banho & Tosa** / **Clínica**.

- **Template semanal:** grade 7 dias × horários, com clique para ativar/desativar slot; ações rápidas "copiar segunda para toda a semana", "definir intervalo 08:00–18:00 a cada 60min".
- **Exceções por data:** calendário onde o admin marca um dia como fechado ou define horários específicos.
- **Guarda-corpo crítico:** ao remover um horário que já possui agendamento ativo, **bloquear** e listar os agendamentos afetados, oferecendo cancelar/remarcar antes. Sem isso, o admin cria agendamentos órfãos — o bug clássico de sistemas de agenda.
- **Clínica:** define `demandLevel` por dia (alimenta o calendário público de visualização).
- Mudanças refletem **imediatamente** no formulário público (mesma store + evento `storage`).

---

## 7. Fase 6 — PWA

### 7.1 Configuração

```ts
// vite.config.ts (trecho)
VitePWA({
  registerType: 'prompt',
  includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'sprite.svg'],
  manifest: {
    name: 'Pet Studio — Clínica, Banho & Tosa e Hotel',
    short_name: 'Pet Studio',
    description: 'Clínica veterinária, banho e tosa, hotel e loja para seu pet.',
    theme_color: '#f0b21d',
    background_color: '#faf7f0',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/?source=pwa',
    lang: 'pt-BR',
    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Agendar banho', url: '/banho-e-tosa' },
      { name: 'Loja', url: '/loja' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,svg}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/admin/],
    runtimeCaching: [
      { urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/, handler: 'CacheFirst',
        options: { cacheName: 'images', expiration: { maxEntries: 80, maxAgeSeconds: 2592000 } } },
      { urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\//, handler: 'StaleWhileRevalidate',
        options: { cacheName: 'map-tiles', expiration: { maxEntries: 100, maxAgeSeconds: 604800 } } },
    ],
  },
})
```

**Ícone maskable é obrigatório** — sem `purpose: 'maskable'` o Android recorta o ícone em círculo e corta a arte.

### 7.2 Botão de instalação não-intrusivo (requisito explícito)

```ts
// src/pwa/useInstallPrompt.ts
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setDeferred(null); setInstalled(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { /* cleanup */ };
  }, []);

  const canInstall = !!deferred && !installed;
  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') notify.success('Pet Studio instalado! 🐾');
    setDeferred(null);
  };
  return { canInstall, install, installed, isIos: isIosSafari() };
}
```

**O ponto que mais se erra aqui:** o Safari/iOS **não dispara `beforeinstallprompt`** — o evento é exclusivo de Chromium. Um botão de instalar programático simplesmente não existe no iOS. Plano:

- **Chromium:** ícone de download discreto no header (desktop) e no footer (mobile) → dispara o prompt nativo. Ocultar quando `canInstall === false`.
- **iOS Safari:** o mesmo ícone abre um modal ilustrado com as instruções manuais: *Compartilhar → Adicionar à Tela de Início*. Detecção por user-agent + ausência de `standalone`.
- **Já instalado:** botão some (checagem de `display-mode: standalone`).
- Sem pop-up automático, sem interstitial. Só o ícone.

### 7.3 Atualização do Service Worker

`registerType: 'prompt'` + toast persistente do Sonner: *"Nova versão disponível"* com ação "Atualizar" → `updateServiceWorker(true)`. Auto-update silencioso recarrega a página no meio do preenchimento de um formulário de agendamento — inaceitável.

### 7.4 Interação SW × localStorage

O SW cacheia **assets**, nunca o `localStorage`. Documentar: limpar dados do site apaga os agendamentos simulados. O botão `resetDemoData()` no admin deve deixar isso claro.

---

## 8. Fase 7 — QA, compatibilidade e acessibilidade

### 8.1 Matriz de compatibilidade (requisito explícito)

| Plataforma | Navegador | Como é verificado |
|---|---|---|
| Windows | Chrome, Edge | Playwright Chromium (CI) + manual |
| macOS | Chrome | Playwright Chromium |
| macOS | **Safari 17+** | Playwright **WebKit** (CI) + verificação manual |
| Android | Chrome | Emulação Playwright (Pixel 7) + **device real** |
| iOS | **Safari (iOS 16+)** | Playwright WebKit + **device real obrigatório** |

**WebKit do Playwright ≈ Safari, não é Safari.** Não reproduz o comportamento de PWA do iOS, cotas de storage do modo privado, nem os bugs de `100vh`. **Um teste manual em iPhone real é um item de aceite não negociável.**

### 8.2 Armadilhas específicas de Safari/iOS já mapeadas

| Problema | Mitigação |
|---|---|
| `100vh` inclui a barra de endereço → corte no layout | `100dvh` com fallback `100vh` |
| Zoom automático ao focar input <16px | `font-size: 16px` em todos os inputs |
| Bloqueio de `window.open` assíncrono | Sempre `<a>` ou `window.open` síncrono (§4.3) |
| `QuotaExceededError` em navegação privada | `MemoryAdapter` de fallback (§3.3) |
| Tap highlight cinza | `-webkit-tap-highlight-color: transparent` + `:focus-visible` próprio |
| Scroll com "borracha" atrás do modal | Radix já trava scroll; validar em iOS |
| `env(safe-area-inset-*)` no notch | Padding no FAB e no footer |
| Sem `beforeinstallprompt` | Modal de instruções (§7.2) |
| `<input type="date">` nativo diverge | Usar sempre o `react-day-picker`, nunca o nativo |

### 8.3 Acessibilidade (meta: WCAG 2.1 AA)

- Navegação completa por teclado; `:focus-visible` claramente visível sobre âmbar e sobre carvão.
- Alvos de toque ≥44×44px.
- Modais: focus trap, retorno do foco ao gatilho (Radix cobre).
- Toasts com `aria-live="polite"`; erros de formulário com `aria-invalid` + `aria-describedby`.
- Slots de horário indisponíveis: `disabled` + `aria-label` explicativo.
- Estados nunca comunicados só por cor — "Esgotado"/"Promoção"/"Urgente" sempre têm texto.
- `axe-core` integrado ao Playwright, com falha de build em violações sérias/críticas.

### 8.4 Estratégia de testes

| Nível | Ferramenta | Alvo |
|---|---|---|
| Unitário | Vitest | `availability.ts`, `datetime.ts`, `money.ts`, `whatsapp.ts`, schemas Zod, migrações |
| Componente | RTL | Formulário de agendamento, filtros da loja, CRUD, modal |
| E2E | Playwright | 6 jornadas críticas (abaixo) |
| Visual | Playwright screenshots | Home, Loja, Agendamento, Admin — light/dark, 375/768/1440 |
| A11y | axe + Playwright | Todas as rotas |

**Jornadas E2E obrigatórias:**
1. Agendamento completo → confirmação no modal → aparece no admin
2. Slot indisponível → bloqueado no formulário público
3. Filtros da loja → URL reflete → F5 preserva
4. Login admin → CRUD de produto → visível na loja pública
5. Admin remarca agendamento → público mostra o novo horário livre/ocupado
6. Instalação PWA (Chromium) + funcionamento offline da Home

---

## 9. Fase 8 — Auditoria de performance e plano de otimização

**Nota metodológica:** não é possível prever pontuações de Lighthouse antes de medir. Esta seção define **o procedimento de medição, os orçamentos que serão exigidos e as alavancas de otimização já identificadas**. Os números reais são preenchidos após a primeira execução e o relatório final é entregue como `PERFORMANCE_AUDIT.md`.

### 9.1 Procedimento de auditoria

1. `npm run build && npm run preview` — **auditar apenas build de produção** (dev tem HMR e sourcemaps, os números não valem nada).
2. Lighthouse em **duas configurações**: Mobile (Moto G Power emulado, 4G throttled) e Desktop.
3. **3 execuções por página**, usar a **mediana** — variância de execução única facilmente engana em 10 pontos.
4. Páginas auditadas: `/`, `/loja`, `/banho-e-tosa`, `/galeria`.
5. `vite-bundle-visualizer` para o mapa de treemap do bundle.
6. **Campo:** Web Vitals reais coletados por 1 semana pós-deploy (`web-vitals` → endpoint no Fase 2). Lab ≠ campo; **INP em especial só aparece com interação real**.

### 9.2 Orçamentos (falham o CI se estourados)

| Métrica | Mobile | Desktop |
|---|---|---|
| Performance (Lighthouse) | ≥ 90 | ≥ 95 |
| Acessibilidade | ≥ 95 | ≥ 95 |
| Best Practices / SEO | ≥ 95 | ≥ 95 |
| **LCP** | ≤ 2.5s | ≤ 1.8s |
| **INP** | ≤ 200ms | ≤ 150ms |
| **CLS** | ≤ 0.1 | ≤ 0.1 |
| TBT | ≤ 200ms | ≤ 100ms |
| **JS inicial (gzip)** | **≤ 160 KB** | idem |
| CSS inicial (gzip) | ≤ 25 KB | idem |
| Peso total da Home | ≤ 600 KB | idem |

Configurado em `lighthouserc.json` (`@lhci/cli`, `assert.assertions`) rodando no CI a cada PR.

### 9.3 Alavancas de otimização — já planejadas, não reativas

#### a) Code-splitting
- `lazy()` por rota (§4.1); **todo `/admin` em um chunk isolado** — o maior ganho único.
- `manualChunks` para separar o que raramente muda do código da aplicação:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router'],
        'vendor-motion': ['motion'],
        'vendor-date': ['date-fns', 'react-day-picker'],
        // leaflet e react-leaflet ficam FORA: só entram via import() dinâmico
      },
    },
  },
  cssCodeSplit: true,
  sourcemap: 'hidden',
}
```

- `import()` dinâmico para: Leaflet (no clique do mapa), lightbox da galeria, gráficos do dashboard admin, gerador de `.ics`.
- `LazyMotion` + `domAnimation` em vez do bundle completo de `motion` (~20 KB economizados).
- Importar ícones Lucide nomeadamente (barrel import derrota o tree-shaking).

#### b) Imagens (o maior peso do site — é um site de fotos de pets)
- Pipeline `sharp` em build: AVIF + WebP + fallback JPEG, em 4 larguras.
- `<picture>` com `srcset`/`sizes` corretos — servir 1920px para uma tela de 375px é o desperdício mais comum.
- `loading="lazy"` + `decoding="async"` em tudo abaixo da dobra; `fetchpriority="high"` só no hero.
- `width`/`height` sempre presentes → CLS 0.
- LQIP base64 (~20px, <1 KB inline) com blur-up.
- `content-visibility: auto` + `contain-intrinsic-size` nos itens da galeria.
- Alvo: hero ≤120 KB, thumbs de galeria ≤40 KB, cards de produto ≤25 KB.

#### c) Fontes
- Self-hosted `woff2`, subset latin/latin-ext (≈70% menor).
- Preload **apenas** do peso usado no LCP.
- `font-display: swap` + `size-adjust` no fallback (elimina CLS de troca de fonte).
- Máximo 4 arquivos de fonte no total.

#### d) JavaScript e runtime
- Compressão **Brotli** no host estático (`vite-plugin-compression` para hosts que não fazem on-the-fly).
- Sem polyfills legados (`build.target: 'es2022'` — cobre a matriz de navegadores exigida).
- Debounce na busca (250ms), `useMemo` na filtragem, `content-visibility` nos grids.
- Animações restritas a `transform`/`opacity`; auditar com o Layers panel do DevTools que nada dispara layout.
- Verificar re-render: seletores Zustand granulares, não a store inteira.

#### e) Rede e cache
- `Cache-Control: max-age=31536000, immutable` nos assets com hash; `no-cache` no `index.html`.
- Precache do Workbox para o shell → segunda visita quase instantânea.
- `<link rel="preconnect">` apenas para tiles do OSM, e só quando o mapa for ativado.
- HTTP/2 ou 3 (padrão nos hosts recomendados).

#### f) Riscos conhecidos de performance neste projeto específico

| Risco | Mitigação planejada |
|---|---|
| Leaflet infla a Home | Imagem estática + `import()` no clique (§5.1) |
| Muitos objetos flutuantes = jank em mobile | Máx. 2 em <640px; só `transform`; sem JS |
| Galeria com muitas imagens grandes | Lazy + AVIF + `content-visibility` + LQIP |
| Bundle do `motion` | `LazyMotion` + `m.*` |
| Chunk do admin no bundle público | Rota lazy isolada + verificação no treemap a cada PR |
| Toaster + FAB + modal disputando z-index | Escala de z-index documentada no design system |

### 9.4 Entregável da auditoria

`PERFORMANCE_AUDIT.md` contendo: pontuações medidas (mediana de 3, mobile+desktop, por página), Core Web Vitals medidos vs. orçamento, treemap do bundle com os 10 maiores módulos, lista priorizada de ações (impacto × esforço), o que foi corrigido, e o que ficou como dívida técnica consciente com justificativa.

---

## 10. Roadmap de migração para o backend (Fase 2 — fora deste escopo)

O que esta arquitetura já deixa pronto:

1. Implementar `HttpProductRepository` etc. em `src/data/http/`, com a **mesma interface** de `ports.ts`.
2. Trocar a fábrica de repositórios por variável de ambiente (`VITE_DATA_SOURCE=local|http`).
3. Reaproveitar os schemas Zod para validar as respostas da API — validação de fronteira já existe.
4. Substituir a sessão simulada por autenticação real (cookie httpOnly). Assinatura do `AuthRepository` não muda.
5. Adicionar TanStack Query **apenas nesse momento** (cache/revalidação de servidor) — desnecessário enquanto os dados são locais.
6. Bloqueio real de slot com verificação de concorrência no servidor (o `SLOT_TAKEN` já está modelado como erro de negócio).

Nenhum componente de `src/features/**` precisa ser alterado.

---

## 11. Riscos e mitigações

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | Datas/fuso horário produzindo agendamento no dia errado | Alto | Strings `yyyy-MM-dd`, `now` injetado, testes em 3 fusos (§3.4) |
| R2 | `localStorage` corrompido quebrando o app | Alto | Zod em toda leitura + fallback para seed (§3.3) |
| R3 | Safari/iOS divergindo do Chromium | Alto | Matriz §8.1 + device real + armadilhas mapeadas em §8.2 |
| R4 | Admin remove horário com agendamento ativo | Médio | Guarda-corpo bloqueante (§6.5) |
| R5 | Bundle crescendo silenciosamente | Médio | Orçamentos no CI desde o dia 1 (§9.2) |
| R6 | Pop-up do WhatsApp bloqueado | Médio | Sempre síncrono / `<a>` (§4.3) |
| R7 | "Login" simulado sendo confundido com segurança real | Médio | Aviso §0.4 + banner de demonstração |
| R8 | Assets de imagem indisponíveis no início | Baixo | Placeholders com dimensão correta desde a Fase 1 |

---

## 12. Cronograma e marcos

| Fase | Escopo | Estimativa | Marco |
|---|---|---|---|
| 0 | Fundação, tooling, CI | 2 dias | Build + CI verdes |
| 1 | Design system, tokens, motion | 4 dias | Kitchen sink aprovado visualmente |
| 2 | Domínio, repositórios, storage | 3 dias | Motor de disponibilidade testado |
| 3 | App shell, rotas, WhatsApp, toasts | 2 dias | Navegação com transições |
| 4 | Home, Loja, Banho & Tosa, Clínica, Galeria | 7 dias | **Demo pública completa** |
| 5 | Painel administrativo | 5 dias | **Fluxo ponta a ponta funcional** |
| 6 | PWA | 2 dias | Instalável em Android + iOS |
| 7 | QA, cross-browser, a11y | 3 dias | Matriz aprovada, axe limpo |
| 8 | Auditoria + otimização | 3 dias | `PERFORMANCE_AUDIT.md` dentro dos orçamentos |

**Total: ~31 dias úteis** para um desenvolvedor. Fases 1 e 2 são paralelizáveis entre dois devs (design system × domínio) sem conflito, reduzindo para ~26.

### Definição de pronto (por feature)
- [ ] Responsivo em 375 / 768 / 1440
- [ ] Teclado + leitor de tela
- [ ] Estados de loading, erro e vazio implementados
- [ ] Movimento reduzido respeitado
- [ ] Testes unitários da lógica + E2E do caminho feliz
- [ ] Sem regressão de orçamento de bundle
- [ ] Verificado em Chromium **e** WebKit

---

## Apêndice A — Referência de configuração do site

```ts
// src/config/site.ts — fonte única de dados do estabelecimento
export const SITE = {
  name: 'Pet Studio',
  whatsapp: '5579999999999',          // placeholder — substituir pelo real
  phoneDisplay: '(79) 99999-9999',
  instagram: 'https://instagram.com/petstudio',
  timezone: 'America/Maceio',
  address: { street: '...', city: 'Aracaju', state: 'SE', zip: '49000-000' },
  coords: { lat: -10.9472, lng: -37.0731 },
  hours: {
    // 0 = domingo
    1: [{ open: '08:00', close: '18:00' }],
    2: [{ open: '08:00', close: '18:00' }],
    3: [{ open: '08:00', close: '18:00' }],
    4: [{ open: '08:00', close: '18:00' }],
    5: [{ open: '08:00', close: '18:00' }],
    6: [{ open: '08:00', close: '12:00' }],
    0: [],
  },
} as const;
```

## Apêndice B — Escala de z-index (documentada para evitar guerra de camadas)

| Camada | z-index |
|---|---|
| Objetos decorativos flutuantes | 0 |
| Conteúdo | 10 |
| Header fixo | 30 |
| FAB do WhatsApp | 40 |
| Overlay de modal | 50 |
| Conteúdo de modal | 51 |
| Toasts (Sonner) | 60 |

## Apêndice C — Itens que dependem do cliente

1. Número real do WhatsApp, endereço e coordenadas
2. Fotos reais para hero e galeria (ou verba de banco de imagens)
3. Catálogo real de produtos e preços
4. Logotipo em vetor
5. Confirmação das fontes (as sugeridas são gratuitas e comercialmente livres)
6. Horários reais de funcionamento e slots padrão de banho e tosa
