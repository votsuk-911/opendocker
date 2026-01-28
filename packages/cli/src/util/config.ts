import { z } from 'zod';

export const KeybindsConfig = z.object({
  leader: z.string().optional().default("ctrl+x").describe("Leader key for keybind combinations"),
  app_exit: z.string().optional().default("ctrl+c,ctrl+d,<leader>q,q").describe("Exit the application"),
  theme_mode_toggle: z.string().optional().default("<leader>t").describe("Toggle between light and dark theme"),
})

export type KeybindsConfig = z.infer<typeof KeybindsConfig>
