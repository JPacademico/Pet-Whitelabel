import type { BookingFormValues } from '@/domain/schemas';
import { Modal, Button } from '@/design-system/primitives';
import { formatDisplayDate } from '@/lib/datetime';

export interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: BookingFormValues;
  submitting: boolean;
  onConfirm: () => void;
}

export function ConfirmationModal({ open, onOpenChange, values, submitting, onConfirm }: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Confirmar agendamento"
      description="Revise os dados antes de confirmar."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            Voltar e editar
          </Button>
          <Button onClick={onConfirm} loading={submitting}>
            Confirmar agendamento
          </Button>
        </>
      }
    >
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Pet</dt>
          <dd className="font-semibold text-charcoal">
            {values.petName} ({values.animalType === 'dog' ? 'Cão' : 'Gato'})
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Tutor</dt>
          <dd className="font-semibold text-charcoal">{values.tutorName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">WhatsApp</dt>
          <dd className="font-semibold text-charcoal">{values.tutorWhatsapp}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Data</dt>
          <dd className="text-right font-semibold text-charcoal capitalize">
            {values.date ? formatDisplayDate(values.date) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Horário</dt>
          <dd className="font-semibold text-charcoal">{values.time}</dd>
        </div>
        {values.notes && (
          <div>
            <dt className="text-muted">Observações</dt>
            <dd className="mt-1 text-charcoal">{values.notes}</dd>
          </div>
        )}
      </dl>
    </Modal>
  );
}
