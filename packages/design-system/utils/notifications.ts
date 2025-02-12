// apps/app/app/utils/notifications.ts
import { toast } from 'sonner';

/**
 * Standard API response type.
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

/**
 * Centralized function to handle API responses.
 * It triggers a success toast if the response status is "success",
 * or an error toast if the response status is "error".
 *
 * @param response - The API response object to handle.
 */
export function handleApiResponse<T>(response: ApiResponse<T>): void {
  if (response.status === 'success') {
    toast.success(response.message);
  } else if (response.status === 'error') {
    toast.error(response.message);
  }
}

/**
 * Centralized function to handle errors from API calls.
 * It displays an error toast with the provided error message.
 *
 * @param error - The error encountered during an API call.
 */
export function handleApiError(error: Error): void {
  toast.error(error.message);
}