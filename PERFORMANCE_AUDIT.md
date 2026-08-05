# Relatório de Performance — Fase 8

> **Data:** 2026-08-05
> **Build auditado:** produção (`npm run build`), Vite 8 / Rolldown
> **Escopo desta rodada:** análise de bundle e composição de chunks (medida).
> **Ainda não executado:** Lighthouse, Core Web Vitals e matriz cross-browser — ver §5.

---

## 1. O que foi efetivamente medido

Esta seção contém **apenas números reais**, extraídos da saída de `vite build` e dos sourcemaps
do bundle de produção. Nada aqui é estimativa.

### 1.1 Carga inicial (rota `/`)

Arquivos referenciados diretamente pelo `dist/index.html`:

| Arquivo | Bruto | Gzip |
|---|---:|---:|
| `index-*.js` | 549,59 kB | **168,65 kB** |
| `jsx-runtime-*.js` | 12,04 kB | 4,29 kB |
| `site-*.js` | 0,51 kB | 0,29 kB |
| **Total JS inicial** | **562,14 kB** | **≈ 173,2 kB** |
| `index-*.css` | 41,43 kB | 7,88 kB |

### 1.2 Chunks sob demanda (não entram na carga inicial)

| Chunk | Gzip | Quando carrega |
|---|---:|---|
| `LazyLeafletMap-*.js` | 50,46 kB | Clique em "Ver mapa interativo" na Home |
| `style-*.js` (react-day-picker) | 13,32 kB | Banho & Tosa, Clínica, Calendário admin |
| `zod-*.js` | 12,31 kB | Sob demanda pelos repositórios |
| `GroomingPage-*.js` | 3,95 kB | `/banho-e-tosa` |
| `AdminCalendarPage-*.js` | 3,70 kB | `/admin/calendario` |
| `AdminProductsPage-*.js` | 3,62 kB | `/admin/produtos` |
| `ShopPage-*.js` | 2,89 kB | `/loja` |
| `AdminBookingsPage-*.js` | 2,61 kB | `/admin/agendamentos` |
| `ClinicPage-*.js` | 2,12 kB | `/clinica` |
| `GalleryPage-*.js` | 1,91 kB | `/galeria` |
| `AdminLoginPage-*.js` | 1,18 kB | `/admin/login` |
| `AdminDashboardPage-*.js` | 1,07 kB | `/admin` |
| `IosInstallModal-*.js` | 0,71 kB | Botão instalar, somente iOS Safari |

**O isolamento do `/admin` está confirmado:** nenhum chunk administrativo aparece na carga
inicial pública. Esse era o maior ganho isolado previsto no plano (§4.1) e ele se confirmou.

### 1.3 Composição do chunk inicial

Extraída dos sourcemaps (contagem de módulos por pacote):

| Pacote | Módulos | Por que está no caminho crítico |
|---|---:|---|
| `date-fns` (+ `@date-fns/tz`) | 92 | Bootstrap do storage → `datetime.ts`. Necessário antes do 1º render |
| Código da aplicação | 56 | Shell, design system, Home |
| `lucide-react` | 45 | Ícones efetivamente renderizados (tree-shaking funcionando) |
| `react-router` | 18 | Roteador |
| `zod` | 17 | Validação de dados do `localStorage` |
| `react-remove-scroll` e afins | ~16 | Dependências do Radix Dialog, içadas por serem compartilhadas |

---

## 2. Comparação com o orçamento do plano (§9.2)

| Métrica | Orçamento | Medido | Status |
|---|---:|---:|---|
| **JS inicial (gzip)** | ≤ 160 kB | **≈ 173 kB** | ❌ **8% acima** |
| **CSS inicial (gzip)** | ≤ 25 kB | 7,88 kB | ✅ 68% abaixo |

**O orçamento de JS não foi atingido.** O número está reportado como medido, sem arredondamento
favorável. As opções para fechar a diferença estão em §4.

---

## 3. Correções aplicadas nesta fase

Três problemas reais de bundle foram encontrados e corrigidos durante a auditoria:

### 3.1 React duplicado entre chunks (correção de correção, não só de performance)

O `output.manualChunks` previsto no plano (§9.3a) é **apenas parcialmente respeitado pelo Rolldown**,
que passou a ser o bundler do Vite 8. Mesmo com o React explicitamente atribuído a um grupo
`vendor-react`, o núcleo do React (incluindo `__CLIENT_INTERNALS`, o dispatcher que faz os hooks
funcionarem) acabou **dentro do chunk do `react-day-picker`**, e uma segunda cópia apareceu no
chunk do `motion`.

Além do risco de duas instâncias de React, isso tinha um efeito colateral direto de performance:
como o React é obrigatoriamente eager, o chunk do `react-day-picker` — **e a folha de estilo
dele, com 8 kB gzip e render-blocking** — era baixado na Home, onde não existe nenhum calendário.

**Correção:** remoção do `manualChunks` manual. O agrupamento nativo do Rolldown resolve isso
corretamente, e o code-splitting que realmente importa (por rota, com o `/admin` isolado) vem do
`lazy()` em `app/router.tsx`, não do agrupamento de vendors.

### 3.2 Radix Dialog no caminho crítico por causa do modal de instalação iOS

O `InstallButton` importava o `Modal` estaticamente para exibir as instruções de "Adicionar à Tela
de Início". Como o botão vive no `Header`, isso arrastava o Radix Dialog e sua árvore de
scroll-lock para o bundle inicial de **todos** os visitantes — inclusive quem está no Chrome
desktop e nunca verá esse modal.

**Correção:** o modal virou um módulo com `lazy()` próprio (`IosInstallModal`, 0,71 kB gzip),
carregado apenas quando um usuário de iOS Safari toca no botão.

### 3.3 Biblioteca de animação: 228 módulos por um fade

`motion` / `framer-motion` respondiam por **228 dos módulos do chunk inicial (~28 kB gzip)** —
o maior item isolado do caminho crítico — para entregar uma transição de página de fade + deslize
de 12px. Mesmo com `LazyMotion` + `domAnimation`, conforme a mitigação prevista no plano (§9.3f),
o custo permaneceu.

**Correção — e desvio consciente do plano:** a transição de página passou a ser feita em CSS puro
(`@keyframes ds-page-enter` + remontagem por `key` da rota). O efeito visual é o mesmo, o custo em
JS é zero, e `prefers-reduced-motion` continua sendo respeitado globalmente. A dependência `motion`
foi **removida** do projeto em vez de ficar instalada sem uso.

> **Nota de desvio:** o plano especifica `motion` na tabela de stack (§0.3) e no §2.7. A troca por
> CSS foi feita porque o orçamento de performance do §9.2 é um requisito com enforcement em CI,
> enquanto a escolha da biblioteca é meio, não fim. Os objetos flutuantes decorativos já eram CSS
> puro por decisão do próprio plano (§2.5), então nada mais dependia da biblioteca.
> **Impacto medido: 195,87 kB → 168,65 kB gzip no chunk inicial.**

---

## 4. Plano de otimização para fechar os 13 kB restantes

Em ordem de relação impacto × esforço:

| # | Ação | Ganho estimado | Esforço | Observação |
|---|---|---:|---|---|
| 1 | Adiar o `bootstrapStorage()` para depois do 1º paint, com import dinâmico do seed | ~12 kB | Médio | Tira `zod` + seed do caminho crítico. A Home **não usa nenhum repositório**, então ela não precisa do bootstrap para renderizar. Exige encadear o `createRoot().render()` após a resolução |
| 2 | Substituir `date-fns`/`TZDate` por `Intl.DateTimeFormat` + `Temporal` polyfill onde aplicável | ~10–15 kB | Alto | 92 módulos é o maior bloco isolado. Alto risco: é justamente o código de fuso horário que o §3.4 blinda com testes |
| 3 | Migrar para `output.advancedChunks` do Rolldown | 0 kB direto | Baixo | Não reduz o total, mas melhora granularidade de cache entre deploys |
| 4 | Auditar os 45 ícones do Lucide no caminho crítico | ~2–4 kB | Baixo | Alguns podem virar símbolos do `sprite.svg` já existente |
| 5 | Brotli no host estático | ~15% sobre todos os números | Baixo | Vercel/Netlify já fazem on-the-fly; validar no deploy real |

**Recomendação:** executar o item 1. Sozinho ele coloca a carga inicial em ~161 kB, praticamente
no orçamento, sem tocar na lógica de datas (que é a área de maior risco do projeto).

---

## 5. O que ainda precisa ser medido

Estes itens do §9.1/§9.2 do plano **não foram executados** e não devem ser considerados aprovados:

- [ ] **Lighthouse** (mobile + desktop, mediana de 3 execuções, por página) contra o build de produção:
      `npm run build && npm run preview`, depois Lighthouse em `/`, `/loja`, `/banho-e-tosa`, `/galeria`
- [ ] **Core Web Vitals medidos** — LCP, INP, CLS. Em especial o **INP só aparece com interação real**
- [ ] **Web Vitals de campo** — exige deploy e coleta por ~1 semana
- [ ] **Matriz cross-browser** (§8.1) — incluindo o teste manual obrigatório em iPhone real
- [ ] **`axe-core`** em todas as rotas
- [ ] Configuração do `lighthouserc.json` com os asserts do §9.2 no CI

### Observações que afetam a medição futura

- As imagens são placeholders remotos (`picsum.photos`). **O peso real de imagem — provavelmente o
  maior fator de LCP deste site — ainda não existe.** O pipeline `sharp` do §9.3b só faz sentido
  depois que as fotos reais chegarem (Apêndice C, item 2).
- As fontes estão como stack de sistema. O `@font-face` self-hosted do §2.2 ainda não foi aplicado,
  então o CLS de troca de fonte ainda não é observável.
- `sourcemap: 'hidden'` gera `.map` no `dist/`. Eles não são referenciados pelos bundles, mas
  **confirme que o host não os publica** ou remova-os no passo de deploy.

---

## 6. Resumo

| Item | Situação |
|---|---|
| Build de produção | ✅ Compila sem erros |
| TypeScript (`strict`) | ✅ Sem erros |
| ESLint | ✅ 0 erros (1 aviso informativo do react-hook-form) |
| Testes unitários | ✅ 37 passando |
| Isolamento do chunk `/admin` | ✅ Confirmado |
| Duplicação de React | ✅ Corrigida |
| Orçamento de CSS inicial | ✅ 7,88 / 25 kB |
| Orçamento de JS inicial | ❌ 173 / 160 kB — plano de correção no §4 |
| Lighthouse / CWV | ⏳ Não executado |
