# Pet Studio — UI

SPA de clínica veterinária, banho & tosa, hotel e loja para pets.
Fase 1: **frontend-only**, com persistência simulada em `localStorage`.

- Plano técnico completo: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)
- Relatório de performance: [`PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md)

## Stack

React 19 · TypeScript (strict) · Vite 8 · TailwindCSS v4 · React Router · Zustand · Zod ·
react-hook-form · date-fns · react-day-picker · Radix UI · Sonner · Leaflet · vite-plugin-pwa

## Começando

```bash
npm install
```

```bash
npm run dev
```

Credenciais de demonstração do painel (`/admin`): copie `.env.example` para `.env.local`.
Os valores padrão são `admin` / `petstudio`.

> ⚠️ **A autenticação do `/admin` é simulada no cliente e não é segurança.** Qualquer pessoa com
> DevTools acessa e edita os dados. Nunca use credenciais reais nem dados pessoais reais neste
> ambiente. Ver §0.4 do plano.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + build de produção |
| `npm run preview` | Serve o build de produção (use este para auditar performance) |
| `npm run typecheck` | Apenas o TypeScript |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:coverage` | Testes com cobertura |
| `npm run icons` | Regera os ícones do PWA a partir do `scripts/generate-icons.mjs` |

## Arquitetura em uma frase

A UI **nunca** fala com o `localStorage` diretamente: tudo passa por interfaces de repositório
assíncronas em `src/data/ports.ts`, implementadas hoje por adaptadores locais em
`src/data/repositories/`. Trocar por um backend HTTP na Fase 2 é reescrever essa pasta — nenhum
componente muda. Uma regra do ESLint bloqueia imports de `data/storage/**` a partir da UI.

```
src/
├── app/            # Router, layouts, providers
├── design-system/  # Tokens, primitivos, motion, decorativos
├── domain/         # Tipos, schemas Zod, motor de disponibilidade (lógica pura)
├── data/           # ports.ts (contrato) + storage/ + repositories/
├── features/       # home, shop, grooming, clinic, gallery, admin
├── lib/            # datetime, money, whatsapp, search, ics, hooks
└── config/site.ts  # Telefone, endereço, horários, coordenadas
```

## Pontos de atenção conhecidos

- **Datas** são strings `'yyyy-MM-dd'` e o "agora" é sempre injetado nas funções puras. Isso evita
  a classe de bug em que `new Date('2026-08-10')` (UTC) aparece como dia 09 em UTC−3.
  Os testes cobrem isso — não troque por `Date` serializado.
- **O `localStorage` é entrada não confiável.** Toda leitura é validada com Zod e cai para o seed
  se estiver corrompida. Em Safari privativo (quota 0) o app cai para um store em memória.
- **A loja é somente catálogo** — sem carrinho, checkout ou pagamento, por requisito.

## Antes de ir para produção

Ver Apêndice C do plano. Em resumo: número real de WhatsApp, endereço e coordenadas, fotos reais,
catálogo real, logotipo em vetor e horários reais em `src/config/site.ts`.
