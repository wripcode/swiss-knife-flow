import { templatesLibrarySchema, type TemplatesLibrary } from "./schema";

export interface LibraryDescriptor {
  id: string;
  provider: string;
}

const loaders: Record<string, () => Promise<unknown>> = {
  "finsweet-v1": () => import("./libraries/finsweet-v1.json"),
  "finsweet-v2": () => import("./libraries/finsweet-v2.json"),
  "memberstack": () => import("./libraries/memberstack.json"),
};

export async function getAvailableLibraries(): Promise<LibraryDescriptor[]> {
  const libraries: LibraryDescriptor[] = [];
  for (const [id, loader] of Object.entries(loaders)) {
    try {
      const raw = await loader();
      const data = (raw as Record<string, any>).default ?? raw;
      libraries.push({ id, provider: data.provider || id });
    } catch (e) {
      console.error(`Failed to load library metadata for ${id}`, e);
    }
  }
  return libraries;
}

const cache = new Map<string, TemplatesLibrary>();

export async function loadLibrary(id: string): Promise<TemplatesLibrary> {
  const cached = cache.get(id);
  if (cached) return cached;

  const loader = loaders[id];
  if (!loader) throw new Error(`Unknown library: ${id}`);

  const raw = await loader();
  const data = (raw as { default?: unknown }).default ?? raw;
  const library = templatesLibrarySchema.parse(data);

  cache.set(id, library);
  return library;
}
