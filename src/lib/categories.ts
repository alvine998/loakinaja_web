import {
  Bike, BookOpen, BriefcaseBusiness, Camera, Car, Dumbbell, Gamepad2, House,
  Monitor, Music, Shirt, Smartphone, Sofa, Sparkles, Tv, Utensils, Watch, Wrench,
  Baby,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiUrl } from './api';

export type Category = { id: string; name: string; slug: string; icon: string };

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'default-handphone', name: 'Handphone', slug: 'handphone', icon: 'Smartphone' },
  { id: 'default-komputer', name: 'Komputer', slug: 'komputer', icon: 'Monitor' },
  { id: 'default-elektronik', name: 'Elektronik', slug: 'elektronik', icon: 'Tv' },
  { id: 'default-kamera', name: 'Kamera', slug: 'kamera', icon: 'Camera' },
  { id: 'default-otomotif', name: 'Otomotif', slug: 'otomotif', icon: 'Car' },
  { id: 'default-properti', name: 'Properti', slug: 'properti', icon: 'House' },
];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Smartphone, Monitor, Tv, Camera, Car, House, Home: House, BookOpen, Shirt,
  Bike, Gamepad2, Sofa, Watch, Wrench, Music, Baby, Dumbbell, Utensils,
  BriefcaseBusiness, Sparkles,
};

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(apiUrl('/categories'));
    if (!response.ok) throw new Error('Unable to load categories');
    const result = await response.json() as { data: Category[] };
    return result.data.length ? result.data : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}
