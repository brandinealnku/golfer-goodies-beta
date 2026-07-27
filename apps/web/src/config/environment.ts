export const APP_MODES = ['demo', 'emulator', 'connected'] as const;
export type AppMode = (typeof APP_MODES)[number];
export function parseAppMode(value: string | undefined): AppMode {
  const candidate = value?.trim() || 'demo';
  if (!APP_MODES.includes(candidate as AppMode))
    throw new Error(
      `Invalid VITE_APP_MODE: "${candidate}". Expected demo, emulator, or connected.`,
    );
  return candidate as AppMode;
}
export const environment = {
  mode: parseAppMode(import.meta.env.VITE_APP_MODE),
  production: import.meta.env.PROD,
} as const;
