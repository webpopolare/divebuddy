import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Resource = CollectionEntry<'resources'>;

const FORCE_PUBLISH = true; // true = mostra tutto subito; false = rispetta le date

export function isPublishedArticle(entry: Article): boolean {
  if (FORCE_PUBLISH) return entry.data.status === 'published';
  return entry.data.status === 'published' && entry.data.publishDate <= new Date();
}

export function isPublishedResource(entry: Resource): boolean {
  if (FORCE_PUBLISH) return true;
  if (!entry.data.publishDate) return true;
  return entry.data.publishDate <= new Date();
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection('articles');
  return articles
    .filter(isPublishedArticle)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export async function getPublishedResources(): Promise<Resource[]> {
  const resources = await getCollection('resources');
  return resources
    .filter(isPublishedResource)
    .sort((a, b) => {
      const aTime = a.data.publishDate?.valueOf() ?? 0;
      const bTime = b.data.publishDate?.valueOf() ?? 0;
      return bTime - aTime;
    });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function readingTime(entry: { body?: string }): number {
  const text = entry.body ?? '';
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}