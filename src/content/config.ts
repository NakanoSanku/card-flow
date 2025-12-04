import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.date().optional(),
		tags: z.array(z.string()).default([]),
		type: z.enum(['prompt', 'script', 'app']).default('prompt'),
		icon: z.string().optional(),
		color: z.string().optional(),
		image: z.string().optional(),
		video: z.string().optional(),
		url: z.string().optional(),
	}),
});

export const collections = { posts };
