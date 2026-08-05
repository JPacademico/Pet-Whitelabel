# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
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
