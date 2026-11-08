import fs from 'node:fs';
import path from 'node:path';
import { url } from './url';

const IMG = ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.gif'];
const AUD = ['.mp3', '.ogg', '.opus', '.m4a', '.wav'];

export interface ResolvedMedia {
  flyer?: string;
  mvs?: string;
  aes?: string;
  screenshots: string[];
  ost: { title: string; src: string }[];
}

const pretty = (file: string) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[\s._-]*/, (m) => m.replace(/[._-]/g, ' '))
    .replace(/[_]+/g, ' ')
    .trim();

/**
 * 自動掃描 public/media/games/<slug>/：
 *   flyer.* / mvs.* / aes.* / screens/* / ost/*
 * frontmatter 的 media 欄位優先。
 */
export function resolveMedia(slug: string, fm: any = {}): ResolvedMedia {
  const dir = path.join(process.cwd(), 'public', 'media', 'games', slug);
  const rel = (...p: string[]) => url(['media', 'games', slug, ...p].join('/'));
  const findOne = (name: string) => {
    for (const ext of IMG) if (fs.existsSync(path.join(dir, name + ext))) return rel(name + ext);
    return undefined;
  };
  const list = (sub: string, exts: string[]) => {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) return [] as string[];
    return fs
      .readdirSync(d)
      .filter((f) => exts.includes(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  };
  return {
    flyer: fm.flyer ?? findOne('flyer'),
    mvs: fm.mvs ?? findOne('mvs'),
    aes: fm.aes ?? findOne('aes'),
    screenshots: fm.screenshots ?? list('screens', IMG).map((f) => rel('screens', f)),
    ost: fm.ost ?? list('ost', AUD).map((f) => ({ title: pretty(f), src: rel('ost', f) })),
  };
}
