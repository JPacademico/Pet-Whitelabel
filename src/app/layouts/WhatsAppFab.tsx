import { MessageCircle } from 'lucide-react';
import { SITE } from '@/config/site';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';

// Fixed on every page, discreet by default, expands with a label on hover (desktop). Sits below
// modals/toasts in the z-index scale — see IMPLEMENTATION_PLAN.md §4.2 and Appendix B.
export function WhatsAppFab() {
  const href = buildWhatsappUrl(SITE.whatsapp, whatsappTemplates.general());

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3 text-white shadow-lg transition-all duration-200 ease-out-soft hover:pr-5 focus-visible:pr-5 md:bottom-6 md:right-6"
    >
      <MessageCircle className="size-7 shrink-0" aria-hidden="true" />
      <span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap opacity-0 transition-all duration-200 ease-out-soft group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
        Falar no WhatsApp
      </span>
    </a>
  );
}
