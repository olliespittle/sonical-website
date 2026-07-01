import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// "In the press" — external coverage. One file per link; no body.
// This is the schema Decap CMS will edit.
const press = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/press' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    source: z.string(),
    url: z.string().url(),
    category: z.string(),
    image: z.string(),
  }),
});

// "From Sonical" — own hosted posts / press releases. Empty at launch;
// the section only renders once at least one post exists.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { press, posts };
