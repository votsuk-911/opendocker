import { z } from 'zod';

export const KeybindsConfig = z.object({
  leader: z.string().optional().default("ctrl+x").describe("Leader key for keybind combinations"),
  app_exit: z.string().optional().default("ctrl+c,ctrl+d,<leader>q,q").describe("Exit the application"),
})

export type KeybindsConfig = z.infer<typeof KeybindsConfig>
