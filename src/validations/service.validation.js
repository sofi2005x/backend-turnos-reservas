import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'name es obligatorio'),
  description: z.string().min(1, 'description es obligatorio'),
  duration: z.number().positive('duration debe ser mayor a 0'),
  price: z.number().min(0, 'price no puede ser negativo'),
  category: z.string().min(1, 'category es obligatorio'),
  available: z.boolean().optional(),
});

// partial() vuelve todos los campos opcionales, útil para un PUT parcial
export const updateServiceSchema = createServiceSchema.partial();

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'debe ser un ObjectId válido de 24 caracteres hexadecimales');

export const serviceIdParamSchema = z.object({
  sid: objectId,
});

export const getServicesQuerySchema = z.object({
  name: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  available: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'price', 'duration', 'category', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});