export interface Heading { id: string; text: string; level: number }
export function parseFrontMatter(src: string): { meta: Record<string, string>; body: string };
export function validateMeta(meta: Record<string, string>, file?: string): string[];
export function renderMarkdown(body: string): { html: string; headings: Heading[] };
export function slugify(s: string): string;
export function wordCount(body: string): number;
