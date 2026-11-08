/** 依 astro.config 的 base 產生站內連結（支援 GitHub Pages 子路徑） */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${base}/${p}`;
}
