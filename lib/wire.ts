import { z } from "zod";
import {
  exerciseSchema,
  planSchema,
  prefsSchema,
  sessionSchema,
} from "./model";
export const configSchema = z.object({
  prefs: prefsSchema,
  plans: z.array(planSchema).min(1).max(120),
  custom: z.array(exerciseSchema).max(1000),
});
export const changeSchema = z.object({
  id: z.uuid(),
  revision: z.int().nonnegative(),
  config: configSchema.optional(),
  sessions: z.array(sessionSchema).max(3000),
  removed: z.array(z.string().min(1).max(160)).max(3000),
});
export type Change = z.infer<typeof changeSchema>;
