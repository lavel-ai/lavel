import { z } from 'zod';

export const documentSchema = z.object({
  title: z.string({
    required_error: 'Document title is required',
  }).min(1, 'Document title is required'),
  
  documentType: z.string({
    required_error: 'Document type is required',
  }),
  
  isCourtDocument: z.boolean().default(false),
  
  typeOfCourtDocument: z.string().optional(),
  
  language: z.string().default('es'),
  
  file: z.custom<File>((val) => val instanceof File, {
    message: 'Please upload a file',
  }).optional(),
});

export const documentsSchema = z.object({
  documents: z.array(documentSchema),
});

export type DocumentSchema = z.infer<typeof documentSchema>;
export type DocumentsSchema = z.infer<typeof documentsSchema>;
