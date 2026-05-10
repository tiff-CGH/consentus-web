import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const procedures = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/procedures' }),
  schema: z.object({
    // Display
    title: z.string(),
    summary: z.string(),

    // Clinical attribution
    clinician: z.string(),
    gmcNumber: z.string(),
    specialty: z.string(),

    // Editorial trust signals
    lastReviewed: z.string(), // ISO date e.g. "2026-05-06"
    publishedAt: z.string(),  // ISO date

    // Video (optional — page renders a placeholder until set)
    streamId: z.string().optional(),
    posterUrl: z.string().optional(),

    // Structured FAQ
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).default([]),

    // Optional ordering / featuring
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { procedures };
