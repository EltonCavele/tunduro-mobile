export class ApiClientError extends Error {
  statusCode?: number;
  data?: unknown;

  constructor(message: string, statusCode?: number, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Nao foi possivel concluir a operacao.'
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'message' in error) {
    const message = Reflect.get(error, 'message');

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}
