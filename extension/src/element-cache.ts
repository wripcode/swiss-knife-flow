type ElementGroup = {
  elementId: string;
  elementType: string;
  classNames: string[];
  attributes: { name: string; value: string }[];
};

const groupCache = new Map<string, ElementGroup>();
const elementRefs = new Map<string, any>();

async function buildElementGroup(el: any): Promise<ElementGroup | null> {
  const [attrs, styles, tag] = await Promise.all([
    el.getAllCustomAttributes().catch(() => []),
    el.styles ? el.getStyles().catch(() => []) : Promise.resolve([]),
    typeof el.getTag === "function" ? el.getTag().catch(() => null) : Promise.resolve(null),
  ]);

  if (!attrs || attrs.length === 0) return null;

  const classNames = await Promise.all(
    styles.map((s: any) =>
      typeof s.getName === "function" ? s.getName() : Promise.resolve("")
    )
  ).then((names: string[]) => names.filter(Boolean));

  return {
    elementId: el.id?.element || `elem-${Math.random().toString(36).slice(2, 8)}`,
    elementType: tag || el.type || "Element",
    classNames,
    attributes: attrs.map((attr: any) => ({ name: attr.name, value: attr.value })),
  };
}

export async function fullScan(wf: any): Promise<ElementGroup[]> {
  const allElements = await wf.getAllElements();
  const withAttrs = allElements.filter((el: any) => el.customAttributes);

  elementRefs.clear();
  withAttrs.forEach((el: any) => {
    const id = el.id?.element;
    if (id) elementRefs.set(id, el);
  });

  const groups = await Promise.all(withAttrs.map(buildElementGroup));

  groupCache.clear();
  for (const g of groups) {
    if (g) groupCache.set(g.elementId, g);
  }

  return Array.from(groupCache.values());
}

export async function patchElement(wf: any, elementId: string): Promise<void> {
  let el = elementRefs.get(elementId);
  if (!el) {
    const all = await wf.getAllElements();
    el = all.find((e: any) => e.id?.element === elementId);
    if (el) elementRefs.set(elementId, el);
  }
  if (!el) {
    groupCache.delete(elementId);
    return;
  }

  const group = await buildElementGroup(el);
  if (group) groupCache.set(elementId, group);
  else groupCache.delete(elementId);
}

export async function resolveElement(wf: any, elementId?: string): Promise<any | null> {
  if (!elementId) return null;
  const cached = elementRefs.get(elementId);
  if (cached) return cached;

  const all = await wf.getAllElements();
  const el = all.find((e: any) => e.id?.element === elementId);
  if (el) elementRefs.set(elementId, el);
  return el || null;
}

export function getCachedGroups(): ElementGroup[] {
  return Array.from(groupCache.values());
}

export function getCacheSize(): number {
  return groupCache.size;
}

export function clearCache() {
  groupCache.clear();
  elementRefs.clear();
}
