import { z } from "zod";

const maxFileSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileListSchema = z
  .unknown()
  .transform((value) =>
    typeof FileList !== "undefined" && value instanceof FileList ? Array.from(value) : []
  );

// PDF Requirement: Form validation for signup
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// PDF Requirement: Form validation for login
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// PDF Requirement: Event form validation
// Validates required fields plus allowed upload types and file size limits.
export const eventSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  date: z.string().min(1, "Date is required."),
  location: z.string().trim().min(2, "Location is required."),
  image: fileListSchema.refine(
    (files) => files.length === 0 || files.every((file) => allowedImageTypes.includes(file.type)),
    "Cover image must be an image file."
  ).refine(
    (files) => files.length === 0 || files.every((file) => file.size <= maxFileSize),
    "Each cover image must be 5MB or smaller."
  ),
  gallery: fileListSchema.refine(
    (files) =>
      files.length === 0 ||
      files.every((file) => [...allowedImageTypes, ...allowedDocumentTypes].includes(file.type)),
    "Gallery files must be images or documents."
  ).refine(
    (files) => files.length === 0 || files.every((file) => file.size <= maxFileSize),
    "Each gallery file must be 5MB or smaller."
  ),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type EventFormInput = z.input<typeof eventSchema>;
export type EventFormValues = z.output<typeof eventSchema>;
