import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from './api';

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const errors = error.response?.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0];
    }
    if (typeof errors === 'string' && errors.trim().length > 0) {
      return errors;
    }

    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
