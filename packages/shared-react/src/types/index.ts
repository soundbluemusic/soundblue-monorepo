export {
  createMessage,
  isMessage,
  isMessageArray,
  type LegacyMessageType,
  legacyTypeToRole,
  type Message,
  type MessageRole,
  roleToLegacyType,
} from './message';

/**
 * Generic Result type for error handling.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Success result type.
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Failure result type.
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Creates a success result.
 */
export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Creates a failure result.
 */
export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}
