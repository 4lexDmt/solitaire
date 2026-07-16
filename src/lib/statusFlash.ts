/** Status-bar flash messages — matches Aevanor Solitaire.dc.html `flashMsg`. */

export const STATUS_FLASH_EVENT = 'aevanor:status-flash';

export function flashStatus(message: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STATUS_FLASH_EVENT, { detail: message }));
}
