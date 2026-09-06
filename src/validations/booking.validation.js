import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'debe ser un ObjectId válido');

export const createBookingSchema = z.object({
  clientName: z.string().min(1, 'clientName es obligatorio'),
  clientEmail: z.string().email('clientEmail debe ser un email válido'),
  date: z.string().min(1, 'date es obligatorio'),
  time: z.string().min(1, 'time es obligatorio'),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  services: z
    .array(
      z.object({
        service: objectId,
        quantity: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

// Valida los params de POST /api/bookings/:bid/services/:sid
export const bookingServiceParamsSchema = z.object({
  bid: objectId,
  sid: objectId,
});