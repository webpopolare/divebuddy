import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    hub: z.enum([
      'inizia-a-immergerti',
      'migliora-la-tua-subacquea',
      'viaggia-in-sicurezza',
      'insegna-con-cura',
      'community',
    ]),
    clusters: z
      .array(
        z.enum([
          'sicurezza-gentile',
          'attrezzatura-consapevole',
          'respiro-e-tecnica',
          'viaggiare-blu',
          'donne-nel-diving',
          'oltre-la-card',
          'didattica',
          'carriera-subacquea',
          'etica-subacquea',
        ])
      )
      .default([]),
    series: z.string().optional(),
    audience: z
      .array(
        z.enum([
          'principiante',
          'open-water',
          'subacquea-in-crescita',
          'viaggiatrice-subacquea',
          'aspirante-istruttrice',
          'istruttrice-junior',
          'istruttrice-esperta',
        ])
      )
      .default([]),
    status: z.enum(['published', 'draft', 'merged', 'archive']).default('published'),
    priority: z.enum(['P1', 'P2', 'P3']).default('P3'),
    tone: z.string().default('ispirazionale'),
    voice: z.string().default('femminile'),
    language: z.string().default('it-IT'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('DiveBuddy'),
    canonical: z.string().optional(),
    ogImage: z.string().optional(),
    cta: z.string().optional(),
    related: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    showToc: z.boolean().default(true),
    showKeyTakeaways: z.boolean().default(true),
    showNewsletter: z.boolean().default(true),
    showComments: z.boolean().default(true),
  }),
});

const hubs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hubs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    intro: z.string(),
    order: z.number(),
    color: z.string().optional(),
    icon: z.string().optional(),
    featuredArticles: z.array(z.string()).optional(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    intro: z.string(),
    order: z.number(),
    hub: z.string().optional(),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    type: z.enum(['checklist', 'guida-rapida', 'template', 'lead-magnet']).default('checklist'),
    audience: z.array(z.string()).default([]),
    publishDate: z.coerce.date().optional(),
    relatedArticles: z.array(z.string()).optional(),
  }),
});

export const collections = {
  articles,
  hubs,
  series,
  resources,
};