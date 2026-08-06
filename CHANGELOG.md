# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Gallery is now admin-managed.** Previously `galleryPhotos` was a hardcoded array in `features/gallery/galleryData.ts` with no way to change it short of editing code. It's now a full data-layer citizen: `GalleryPhoto` moved to `domain/types.ts`, backed by a new `gallery-photos` localStorage collection (schema version bumped to **3** — existing browsers reseed once, same as the v1→v2 hotel migration), a `GalleryRepository` port, and `localGalleryRepository`. `/admin/galeria` lets the admin add a photo (URL, description, dog/cat tag, aspect ratio, with a live broken-image-checking preview) or remove one (confirm dialog + "Desfazer" undo toast, same pattern as product deletion). The public `/galeria` page now fetches through the repository instead of the static array, so admin edits show up there immediately — same `useLiveQuery`/`dataVersion` mechanism every other admin edit already uses.
- **Store filters.** `AdminProductsPage` gained stylized `FilterChip` filters to the right of the search box — item type (Ração/Brinquedos/Higiene), Esgotados, and Promoção — with a "Limpar" reset and a result-count line, mirroring the filter UI already used on the public Shop page.

### Changed
- **Admin panel remaster (`/admin`):**
  - **Navigation now sticks.** The sidebar is `sticky top-0 h-dvh` on desktop and the nav pill row pins under the brand bar on mobile, so switching sections never means scrolling back to the top. Nav items carry live counters (products out of stock, bookings today), and there's a "Ver site público" link plus a back-to-top button.
  - **Weekly hours are now a grid, not seven walls of chips.** `WeeklyTemplateEditor` renders times as rows and weekdays as columns, with a sticky header row and sticky time column. Teal = open, **red = closed**, amber inset ring + count = the hour already has bookings. Click-and-drag paints a block of hours (mouse only — touch stays tap-per-cell); clicking a time label applies it to the whole week; clicking a weekday header opens that day's actions (preset, copy to Mon–Fri, copy to all, close the day). Times are grouped under Manhã / Tarde / Noite bands.
  - **The "don't orphan a booking" guard now covers bulk edits.** Every change routes through one `commit()` that diffs the whole template, so the preset and copy shortcuts can no longer silently remove an hour that still has bookings on it — previously only single-cell toggles were checked. The blocking dialog lists every affected booking.
  - **Date exceptions gained per-date hours.** `DateOverrideEditor` can now give a single date its own opening times (seeded from that weekday's template) instead of only closing it, backed by the `DateOverride.slots` field the domain already supported. Closed dates render red on the calendar, custom dates get a teal ring, and an "Próximas exceções" list gives one-click "voltar ao padrão".
  - **Demand editors are clearer.** `ClinicDemandEditor` gets a colour legend, level buttons with icons and explanations, a 14-day strip for seeing the run of levels at once, and a warning when a level is set on a date the service is closed (where it would never surface publicly).
  - **Dashboard rebuilt around the public site.** Animated stat cards, plus a "Seções do site" panel showing each public page's live state (open/closed today, hours available, stock, demand) with links to both the editor and the page itself, an "Agenda de hoje" list, and a confirmation dialog on "Reiniciar demonstração" (it was previously a one-click wipe).
  - Shared `AdminPageHeader` / `AdminSection` / `StatCard` / `SiteSectionCard` / `Legend` components under `features/admin/shared/`, and admin keyframes (entrance stagger, slot pop, save-bar slide, nav marker) added to `tokens.css`.
- **`CountUp` handles values that arrive late.** It previously froze at whatever `to` was on mount whenever animation was skipped (reduced motion, or no `IntersectionObserver`), which would have shown a permanent `0` for the dashboard's async counters. It now reads `to` during render on the skip path and animates from the current value rather than restarting at zero.
- **Mobile UX/UI Improvements:**
  - Added `overflow-x-hidden` to the main layout (`PublicLayout`) to prevent horizontal scrolling that caused the fixed WhatsApp button to vanish on mobile.
  - Fixed the PWA install button on the mobile menu (`Header`) by integrating the text label into the button component (`InstallButton`), ensuring it only appears and is clickable when installation is actually supported.
  - Updated the WhatsApp button on product cards (`ProductCard`) to show only the icon on mobile devices, keeping the text "Consultar" exclusively for desktop.
  - Adjusted positioning of the global WhatsApp Floating Action Button (`WhatsAppFab`) using fixed tailwind coordinates instead of `safe-area-inset-bottom`, resolving the jumping/vanishing behavior during mobile scroll.
  - Kept the "Pet" (Animal) filter always visible in the Shop tab (`ProductFilters`), while the remaining filters remain toggleable on mobile to optimize space.
  - Increased `z-index` of the WhatsApp Floating Action Button (FAB) to `z-50` to prevent it from vanishing or going partially off-screen during scroll on the main "Inicio" tab.
  - Updated the Shop tab (`ShopPage`) mobile grid layout to display 2 item cards side-by-side (`grid-cols-2`) instead of a single column, maximizing screen space efficiency.
  - Made the filters in the Shop tab (`ProductFilters`) togglable on mobile devices, keeping them untoggled by default to save vertical space.

### Removed
- **Home Page:**
  - Removed the moving letter carrousel (Marquee component) on the main "Inicio" tab for both mobile and desktop to reduce visual clutter and fix potential horizontal scroll overflow.
