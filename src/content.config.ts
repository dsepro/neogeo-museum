import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const move = z.object({
  name: z.string(),
  /** 數字鍵盤記法：236P、623K、[2]8P、2141236P、AB…  */
  input: z.string(),
  type: z.enum(['system', 'normal', 'command', 'special', 'super']).optional(),
  note: z.string().optional(),
});

const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    titleJa: z.string().optional(),
    year: z.number().int().min(1990).max(2004),
    genre: z.enum(['fighting', 'action', 'sports-puzzle']),
    subgenre: z.string(),
    developer: z.enum(['snk', 'adk', 'nazca', 'other']),
    developerName: z.string(),
    publisher: z.string().optional(),
    players: z.string().optional(),
    featured: z.boolean().optional(),
    /** 手動指定媒體路徑（可省略：系統會自動掃描 public/media/games/<slug>/） */
    media: z
      .object({
        flyer: z.string().optional(),
        mvs: z.string().optional(),
        aes: z.string().optional(),
        screenshots: z.array(z.string()).optional(),
        ost: z.array(z.object({ title: z.string(), src: z.string() })).optional(),
      })
      .optional(),
    controls: z.array(z.object({ button: z.string(), action: z.string() })).optional(),
    moves: z.array(z.object({ character: z.string(), moves: z.array(move) })).optional(),
    softDip: z
      .array(z.object({ name: z.string(), options: z.string(), default: z.string().optional() }))
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { games };
