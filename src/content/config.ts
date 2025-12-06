import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.date().optional(),
		type: z
			.enum(['prompt', 'script', 'video', 'app', 'github', 'website', 'music', 'mcp'])
			.default('prompt'),
		icon: z.string().optional(),
		color: z.string().optional(),
		image: z.string().optional(),
		video: z.string().optional(),
		url: z.string().optional(),
		wingetId: z.string().optional(),
	}),
});

export const collections = { posts };
