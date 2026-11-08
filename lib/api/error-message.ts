import type { AxiosError } from 'axios';

/* One place for user-facing API error text: backend message first, then a
   sensible fallback per status. Replaces raw axios messages that leak to
   the UI ("REQUEST FAILED WITH STATUS CODE 409"). */
const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Datos inválidos. Revisa los campos e intenta de nuevo.',
  401: 'Credenciales inválidas',
  403: 'No tienes permiso para hacer esta acción',
  404: 'No encontramos lo que buscabas',
  409: 'Ya existe un registro con esos datos',
  429: 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
};

const NETWORK_ERROR = 'No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
const GENERIC_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.';

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; msg?: string; error?: string }> | undefined;

  if (axiosError?.isAxiosError) {
    const backend =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.msg ??
      axiosError.response?.data?.error;

    if (typeof backend === 'string' && backend.trim()) {
      return backend;
    }

    const status = axiosError.response?.status;
    if (!status) return NETWORK_ERROR;
    if (axiosError.code === 'ECONNABORTED') return 'La conexión tardó demasiado. Intenta de nuevo.';
    if (status >= 500) return NETWORK_ERROR;
    return STATUS_FALLBACKS[status] ?? GENERIC_ERROR;
  }

  if (error instanceof Error && error.message) return error.message;
  return GENERIC_ERROR;
}
