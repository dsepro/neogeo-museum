import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveMedia } from './media';

export type Game = CollectionEntry<'games'>;

export async function getGames(): Promise<Game[]> {
  const all = await getCollection('games');
  return all.sort((a, b) => a.data.year - b.data.year || a.data.title.localeCompare(b.data.title));
}

export function thumbOf(g: Game): string | undefined {
  return resolveMedia(g.id, g.data.media).screenshots[0];
}
