import { z } from "zod";

const roleSchema = z.enum(["CLIENT", "ADMIN"]);

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  email: z.string().trim().toLowerCase().email("Email invalide."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(10, "10 caractères minimum.").max(72),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  role: roleSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
