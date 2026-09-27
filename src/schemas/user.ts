import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["CLIENT", "TRANSLATOR", "ADMIN"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
