export interface ToastState {
  readonly msg: string;
  readonly icon: string;
  readonly show: boolean;
}

export const TOAST_DEFAULT_ICON = '✅';
export const TOAST_DURATION_MS = 3200;
