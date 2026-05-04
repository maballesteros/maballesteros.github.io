import type { NativeFilePayload } from '@/types';

export const isTauriRuntime = () => Boolean(window.__TAURI_INTERNALS__);

const invokeTauri = async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
};

export const openNativeKfgFile = async () => invokeTauri<NativeFilePayload | null>('open_kfg_file');

export const openDefaultNativeKfgFile = async () => invokeTauri<NativeFilePayload | null>('open_default_kfg_file');

export const saveNativeKfgFile = async (path: string, contents: string) =>
  invokeTauri<string>('save_kfg_file', { path, contents });

export const saveNativeKfgFileAs = async (contents: string, suggestedName: string) =>
  invokeTauri<string | null>('save_kfg_file_as', { contents, suggestedName });

export const readBrowserFile = async (file: File): Promise<NativeFilePayload> => ({
  path: file.name,
  contents: await file.text()
});

export const downloadTextFile = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: 'application/x-yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
