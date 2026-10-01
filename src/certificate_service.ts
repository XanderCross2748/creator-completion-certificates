import { generatePdf } from "./infrai_pdf.ts";
import { z } from "zod";

export type Completion = { participant: string; course: string; completedAt: string; email: string };
export const completionSchema = z.object({
  participant: z.string().trim().min(1),
  course: z.string().trim().min(1),
  completedAt: z.string().min(1),
  email: z.string().email()
});

export function certificateMarkup(input: Completion): string {
  completionSchema.parse(input);
  return `<main><h1>Completion certificate</h1><p>This certifies that <strong>${input.participant}</strong> completed <strong>${input.course}</strong>.</p><p>${input.completedAt}</p></main>`;
}

export async function issueCertificate(input: Completion): Promise<{ participant: string; pdf: unknown }> {
  completionSchema.parse(input);
  const pdf = await generatePdf({
    html: certificateMarkup(input),
    page_size: "A4",
    orientation: "portrait",
    store: true
  });
  return { participant: input.participant, pdf };
}
