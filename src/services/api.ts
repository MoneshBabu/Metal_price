import { MetalData } from '../types';

export const fetchMetalPrice = async (id: string): Promise<MetalData> => {
  try {
    const response = await fetch(`/api/metal/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${id} price`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Error in fetchMetalPrice for ${id}:`, err);
    throw err;
  }
};
