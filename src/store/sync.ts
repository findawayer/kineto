import { hasKey, removeItem } from 'helpers';
import type { KinetoId, KinetoInterface, SyncStore } from 'typings';
import { dispatch, getInstanceById } from './main';

/**
 * Object grouping multiple instances with the same `syncId`;
 * Each key represents the syncId and value id of instances in sync.
 */
const syncRef: SyncStore = {};

/**
 * Make a Kineto instance follow movements of other instances with the same `syncId`.
 * - Moving to another slide will make sibling instances move simultaneously.
 * - Only the first-registered instance of a `syncId` can have streaming enabled;
 *   instances registered subsequently will be automatically disabled.
 *
 * @param kineto - The instance to get in sync.
 */
function sync(kineto: KinetoInterface): void {
  const { id, options, syncId } = kineto;
  // First entry for this `syncId`
  if (!hasKey(syncRef, syncId)) {
    // Add entry data
    syncRef[syncId] = {
      entries: [id],
      stream: options.stream,
    };
    // Start streaming if `stream` option is active
    // (`stream` component does not trigger autoplay when `syncId` is set)
    if (options.stream) {
      kineto.stream.play();
    }
  }
  // The other entries with same `syncId`
  else {
    const { entries, stream } = syncRef[syncId];
    // Add entry data
    syncRef[syncId] = {
      entries: [...entries, id],
      stream: stream || options.stream,
    };
    // Start streaming first entry if it was not.
    if (!stream) {
      const syncBase = getInstanceById(entries[0]);
      syncBase.stream.play();
    }
  }
  // When this instance moves, move other synced instances altogether.
  kineto.on('passivechange', handlePassiveChange);
  kineto.on('pause', handlePause);
  console.debug(`✅ [ID:${kineto.id}] Synced to syncId ${syncId}.`);
}

/**
 * Remove a Kineto instance from sync.
 *
 * @param kineto - The instance to remove from sync.
 */
function unsync(kineto: KinetoInterface): void {
  const { id, syncId } = kineto;
  // Never mind if it has never been synced
  if (!hasKey(syncRef, syncId)) {
    return;
  }
  const { entries, stream } = syncRef[syncId];
  // Remove the instance from entries
  const newEntries = removeItem(entries, id);
  syncRef[syncId].entries = newEntries;
  // Shift the streaming instance to the next one.
  if (stream && newEntries.length) {
    const syncBase = getInstanceById(newEntries[0]);
    syncBase.stream.play();
  }
  kineto.off('passivechange', handlePassiveChange);
  kineto.off('pause', handlePause);
  console.debug(`❌ [ID:${kineto.id}] Unsynced from syncId ${syncId}.`);
}

/**
 * Sync/unsync a Kineto instance based on the presence of `syncId` member.
 *
 * @param kineto - The instance to sync or unsync.
 */
function toggleSync(kineto: KinetoInterface, force: boolean): void {
  force ? sync(kineto) : unsync(kineto);
}

/**
 * Test if a Kineto instance is the first instance of the same syncId.
 *
 * @param kineto - The instance to test.
 */
function isSyncBase({ id, syncId }: KinetoInterface): boolean {
  return syncRef[syncId].entries[0] === id;
}

/**
 * Find all instances with the same `syncId` value and return their `id`.
 *
 * @param kineto - The instance that we search for the same `syncId` as.
 * @returns The ids of synced instances.
 */
function getSyncedIds(kineto: KinetoInterface): KinetoId[] {
  const { syncId } = kineto;
  return hasKey(syncRef, syncId) ? syncRef[syncId].entries : [];
}

/**
 * Find other instances with the same `syncId` value and return their `id`.
 *
 * @param kineto - The instance that we search for the same `syncId` as.
 * @returns The ids of other synced instances.
 */
function getSyncedSiblingIds(kineto: KinetoInterface): KinetoId[] {
  const { id } = kineto;
  return getSyncedIds(kineto).filter(value => value !== id);
}

/**
 * Event handler for internal `passivechange` event. The event is triggered
 * when an instance is forcing its sibling instances to follow its movement.
 *
 * @param nextIndex - Index of destination slide.
 */
function handlePassiveChange(nextIndex: number): void {
  dispatch({
    action: 'goTo',
    target: getSyncedSiblingIds(this),
    parameters: [nextIndex, { passive: true }],
  });
}

/**
 * Event handler for internal `pause` event. When an instance in sync pauses streaming,
 * make the other ones in sync also pause.
 */
function handlePause(): void {
  const target = getSyncedSiblingIds(this);
  dispatch({
    action: 'pause',
    target,
    parameters: [{ passive: true }],
  });
}

export { toggleSync, isSyncBase, getSyncedIds };
