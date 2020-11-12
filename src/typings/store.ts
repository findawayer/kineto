import type { KinetoInterface, KinetoId } from './core';
import type { BaseOptions } from './options';

// Store holding all Kineto instances that have been created.
export type MainStore = Record<KinetoId, KinetoInterface>;

// Store holding relational data between Kineto instances with same `syncId` value.
export type SyncStore = Record<
  BaseOptions['syncId'],
  {
    entries: KinetoId[];
    stream: boolean;
  }
>;
