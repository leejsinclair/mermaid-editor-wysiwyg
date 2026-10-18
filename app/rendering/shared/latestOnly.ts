/**
 * Runs asynchronous work so that only the newest call's answer is delivered: an answer that arrives for an older
 * call resolves to `undefined`, and an older call's failure is dropped (research R7).
 */
export function latestOnly() {
  let latest = 0;
  return async <T>(work: () => Promise<T>): Promise<T | undefined> => {
    latest += 1;
    const mine = latest;
    try {
      const value = await work();
      return mine === latest ? value : undefined;
    } catch (error) {
      if (mine === latest) throw error;
      return undefined;
    }
  };
}
