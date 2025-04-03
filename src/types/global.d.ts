/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/global.d.ts
export {};

declare global {
  let global: any; // or a more specific type if you want
  let view: unknown;
  let STORIES: unknown;
}
