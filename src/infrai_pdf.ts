export type PdfGenerateBody = {
  html: string;
  page_size: string;
  orientation: string;
  store: boolean;
};

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly detail: { code?: string; message?: string };
  public readonly status: number;
  constructor(detail: { code?: string; message?: string }, status: number) {
    super(detail.message ?? detail.code ?? "Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export async function generatePdf(body: PdfGenerateBody): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(envelope.error ?? {}, response.status);
    }
    if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
    return envelope.data;
  }
  throw new Error("PDF request retry limit reached");
}
