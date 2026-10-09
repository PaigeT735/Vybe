/** Build a sized Unsplash URL from a photo id ("photo-…"). */
export function img(id: string, w: number, h?: number) {
  const size = h ? `&w=${w}&h=${h}` : `&w=${w}`;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70${size}`;
}

export function srcSet(id: string, w: number, h?: number) {
  return `${img(id, w, h)} 1x, ${img(id, w * 2, h ? h * 2 : undefined)} 2x`;
}
