const BUILD_SELF_HEAL_KEY = 'tube_digest_last_build_sha';
const BUILD_SELF_HEAL_RAN_KEY = 'tube_digest_self_heal_ran_for_sha';

function getBuildSha(): string {
  const candidates = [
    typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : undefined,
    typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : undefined,
    import.meta.env.VITE_GIT_SHA,
    import.meta.env.VERCEL_GIT_COMMIT_SHA,
  ];
  const sha = candidates.find((v) => v && v.length > 0);
  return sha || 'unknown';
}

async function clearCaches() {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (e) {
    // ignore
  }

  try {
    // Delete all cache storage entries
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    // ignore
  }

  // IndexedDB cleanup: best effort
  if (window.indexedDB && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      await Promise.all(
        (dbs || []).map((db) => (db?.name ? new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(db.name as string);
          req.onsuccess = req.onerror = req.onblocked = () => resolve(undefined);
        }) : Promise.resolve()))
      );
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Self-heal cache when build changes (production only).
 * Silent; guarded to avoid reload loops.
 */
export async function runBuildSelfHeal() {
  const buildSha = getBuildSha();
  if (buildSha === 'unknown') return;
  if (import.meta.env.DEV) return;

  const lastSha = localStorage.getItem(BUILD_SELF_HEAL_KEY);
  const ranFor = localStorage.getItem(BUILD_SELF_HEAL_RAN_KEY);

  // Already healed for this build
  if (ranFor === buildSha) return;

  if (lastSha && lastSha === buildSha) {
    // same build, nothing to do
    return;
  }

  // Mark to avoid loops
  localStorage.setItem(BUILD_SELF_HEAL_RAN_KEY, buildSha);

  await clearCaches();

  localStorage.setItem(BUILD_SELF_HEAL_KEY, buildSha);

  // One soft reload
  window.location.reload();
}

