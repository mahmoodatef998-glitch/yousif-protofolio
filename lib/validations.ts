/**
 * Validation schemas using Zod
 * Used for validating API request bodies and form inputs
 */

import { z } from 'zod';

// Content Item Schema
export const contentItemSchema = z.object({
  section_id: z.string().uuid('Invalid section ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  media_type: z.enum(['image', 'video']),
  media_url: z.string().url('Invalid media URL'),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional().nullable(),
  cloudinary_public_id: z.string().optional().nullable(),
  order_index: z.number().int().min(0).optional().default(0),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  group_id: z.string().max(100).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

// About Content Schema
export const aboutContentSchema = z.object({
  bio_text: z.string().min(1, 'Bio text is required').max(5000, 'Bio text too long'),
  profile_image_url: z.string().url('Invalid profile image URL').optional().nullable(),
  stats: z.object({
    projects: z.number().int().min(0).optional(),
    clients: z.number().int().min(0).optional(),
    experience: z.number().int().min(0).optional(),
  }).optional().nullable(),
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  phone: z.string().max(20).optional().nullable(),
});

// Content Review Schema
export const contentReviewSchema = z.object({
  content_item_id: z.string().uuid('Invalid content item ID'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long').optional().nullable(),
  user_name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional().nullable(),
});

// Content Interaction Schema
export const contentInteractionSchema = z.object({
  content_item_id: z.string().uuid('Invalid content item ID'),
  action: z.enum(['like', 'unlike', 'view']),
});

// Review Approval Schema
export const reviewApprovalSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  action: z.enum(['approve', 'reject', 'unapprove']),
});

// Section Update Schema
export const sectionUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  is_active: z.boolean().optional(),
});

// Cloudinary Upload Schema
export const cloudinaryUploadSchema = z.object({
  file: z.instanceof(File).or(z.string()),
  folder: z.string().optional(),
  public_id: z.string().optional(),
  resource_type: z.enum(['image', 'video', 'auto']).optional(),
});

// Helper function to validate and parse request body
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }
}

// Type exports for TypeScript
export type ContentItemInput = z.infer<typeof contentItemSchema>;
export type AboutContentInput = z.infer<typeof aboutContentSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContentReviewInput = z.infer<typeof contentReviewSchema>;
export type ContentInteractionInput = z.infer<typeof contentInteractionSchema>;
export type ReviewApprovalInput = z.infer<typeof reviewApprovalSchema>;
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;
export type CloudinaryUploadInput = z.infer<typeof cloudinaryUploadSchema>;

