/// <reference types="vite/client" />

// Extend ImportMeta for Vite environment
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For scripts that use process
declare const process: {
  env: {
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
  argv: string[];
};
