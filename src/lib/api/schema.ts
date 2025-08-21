// ===================================================================
// ARNVERSE API Schema Validation
// Runtime validation untuk response API menggunakan Zod
// ===================================================================

import { z } from 'zod';

// ===================================================================
// Schema untuk raw API responses (snake_case)
// ===================================================================

export const ApiAuthorSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(val => Number(val)),
  username: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  is_verified: z.boolean().optional().default(false),
  is_exclusive: z.boolean().optional().default(false),
  is_private: z.boolean().optional().default(false),
}).nullable();

export const ApiPostSchema = z.object({
  id: z.union([z.number(), z.string()]),
  content: z.string().optional().default(''),
  media_urls: z.array(z.string()).optional().default([]),
  hashtags: z.array(z.string()).optional().default([]),
  likes_count: z.number().optional().default(0),
  comments_count: z.number().optional().default(0),
  shares_count: z.number().optional().default(0),
  views_count: z.number().optional().default(0),
  is_liked: z.boolean().optional().default(false),
  is_saved: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  author: ApiAuthorSchema,
});

export const ApiCommentSchema = z.object({
  id: z.union([z.number(), z.string()]),
  content: z.string().optional().default(''),
  created_at: z.string().optional(),
  likes: z.number().optional().default(0),
  author: ApiAuthorSchema,
});

export const ApiStorySchema = z.object({
  id: z.union([z.number(), z.string()]),
  media_url: z.string().optional().default(''),
  media_type: z.enum(['image', 'video']).optional().default('image'),
  content: z.string().optional().default(''),
  duration: z.number().optional().default(15),
  created_at: z.string().optional(),
  expired_at: z.string().optional(),
  is_viewed: z.boolean().optional().default(false),
  author: ApiAuthorSchema,
});

// ===================================================================
// Schema untuk API Response wrapper
// ===================================================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    meta: z.object({
      total: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional(),
  });

// ===================================================================
// Specific response schemas
// ===================================================================

export const FeedResponseSchema = ApiResponseSchema(
  z.array(ApiPostSchema)
);

export const CommentsResponseSchema = ApiResponseSchema(
  z.object({
    items: z.array(ApiCommentSchema),
    nextCursor: z.string().optional(),
  })
);

export const StoriesResponseSchema = ApiResponseSchema(
  z.array(ApiStorySchema)
);

export const AuthResponseSchema = ApiResponseSchema(
  z.object({
    user: z.object({
      id: z.number(),
      username: z.string(),
      display_name: z.string().nullable(),
      email: z.string(),
      avatar: z.string().nullable(),
      is_verified: z.boolean().optional().default(false),
      is_admin: z.boolean().optional().default(false),
    }),
    token: z.string(),
  })
);

// ===================================================================
// Validation helper functions
// ===================================================================

export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint: string
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.warn(`[Schema] Validation failed for ${endpoint}:`, error);
    console.warn(`[Schema] Raw data:`, data);
    
    // Return null untuk graceful degradation
    return null;
  }
}

export function safeParseApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  endpoint: string
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMsg = `Validation failed for ${endpoint}: ${result.error.message}`;
    console.warn('[Schema]', errorMsg, { rawData: data, issues: result.error.issues });
    return { success: false, error: errorMsg };
  }
}

// ===================================================================
// Type exports untuk TypeScript inference
// ===================================================================

export type ApiAuthorType = z.infer<typeof ApiAuthorSchema>;
export type ApiPostType = z.infer<typeof ApiPostSchema>;
export type ApiCommentType = z.infer<typeof ApiCommentSchema>;
export type ApiStoryType = z.infer<typeof ApiStorySchema>;