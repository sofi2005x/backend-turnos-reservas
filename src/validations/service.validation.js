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