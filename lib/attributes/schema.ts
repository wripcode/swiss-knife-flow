import { z } from "zod/v4";

export const requirementEnum = z.enum(["must-have", "optional", "logic"]);

export const templatesAttributeSchema = z.object({
  key: z.string(),
  valueOptions: z.array(z.string()).optional().default([]),
  requirement: requirementEnum,
  description: z.string(),
});

export const templatesCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  attributes: z.array(templatesAttributeSchema),
});

export const templatesLibrarySchema = z.object({
  id: z.string(),
  provider: z.string(),
  docsUrl: z.string(),
  script: z.object({
    hostedLocation: z.string(),
    integrityHash: z.string().optional(),
    version: z.string(),
    displayName: z.string(),
  }),
  categories: z.array(templatesCategorySchema),
});

export type Requirement = z.infer<typeof requirementEnum>;
export type TemplatesAttribute = z.infer<typeof templatesAttributeSchema>;
export type TemplatesCategory = z.infer<typeof templatesCategorySchema>;
export type TemplatesLibrary = z.infer<typeof templatesLibrarySchema>;
