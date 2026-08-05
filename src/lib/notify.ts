import { toast } from 'sonner';

// Thin wrapper so toast copy/behavior stays consistent across the app instead of every call site
// picking its own wording. See IMPLEMENTATION_PLAN.md §4.4.
export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  info: (message: string, description?: string) => toast.info(message, { description }),
};
