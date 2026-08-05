import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'bookings.json');

async function readFile() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeFile(bookings) {
  await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf-8');
}

export const bookingsDao = {
  async create(bookingData) {
    const bookings = await readFile();
    const newId = bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
    const newBooking = { id: newId, ...bookingData };

    bookings.push(newBooking);
    await writeFile(bookings);
    return newBooking;
  },

  async getById(id) {
    const bookings = await readFile();
    return bookings.find((b) => b.id === Number(id)) || null;
  },

  async update(id, changes) {
    const bookings = await readFile();
    const index = bookings.findIndex((b) => b.id === Number(id));
    if (index === -1) return null;

    bookings[index] = { ...bookings[index], ...changes };
    await writeFile(bookings);
    return bookings[index];
  },
};