import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import { type Client } from "../../../shared/data/clientStorage";
import ActionButton from "../buttons/ActionButton";

interface ClientDuplicateHandlerProps {
  existingClient: Client;
  loading: boolean;
  onResendActivation?: () => void;
  onReactiveClient?: () => void;
  onUnblockClient?: () => void;
  onViewDetails?: () => void;
}

export default function ClientDuplicateHandler({
  existingClient,
  loading,
  onResendActivation,
  onReactiveClient,
  onUnblockClient,
  onViewDetails,
}: ClientDuplicateHandlerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <div className="flex gap-4">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Cliente ya existe en el sistema
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            Se encontró un cliente existente con los mismos datos:
          </p>

          <div className="rounded-lg bg-white p-4 mb-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Razón Social</p>
              <p className="text-sm font-medium text-slate-900">{existingClient.businessName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Código</p>
                <p className="text-sm font-medium text-slate-900">{existingClient.code}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Estado</p>
                <p className="text-sm font-medium text-slate-900">{existingClient.status}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {onViewDetails && (
              <ActionButton
                label="Ver detalles del cliente"
                onClick={onViewDetails}
                disabled={loading}
                variant="outline"
                fullWidth
              />
            )}

            {onResendActivation && (
              <ActionButton
                label="Reenviar correo de activación"
                onClick={onResendActivation}
                disabled={loading}
                variant="outline"
                fullWidth
              />
            )}

            {onReactiveClient && (
              <ActionButton
                label="Reactivar cliente"
                onClick={onReactiveClient}
                disabled={loading}
                variant="primary"
                fullWidth
              />
            )}

            {onUnblockClient && (
              <ActionButton
                label="Desbloquear cliente"
                onClick={onUnblockClient}
                disabled={loading}
                variant="primary"
                fullWidth
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
