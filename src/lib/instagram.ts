import crypto from "crypto";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function getAccessToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "INSTAGRAM_ACCESS_TOKEN não configurado. Defina a variável de ambiente antes de enviar mensagens."
    );
  }
  return token;
}

async function callSendApi(body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH_BASE}/me/messages?access_token=${getAccessToken()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Instagram Graph API error (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return data;
}

export async function sendTextMessage(recipientId: string, text: string) {
  return callSendApi({
    recipient: { id: recipientId },
    message: { text },
  });
}

export async function sendImageMessage(recipientId: string, imageUrl: string) {
  return callSendApi({
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "image",
        payload: { url: imageUrl, is_reusable: true },
      },
    },
  });
}

export async function sendQuickReplies(
  recipientId: string,
  text: string,
  replies: string[]
) {
  return callSendApi({
    recipient: { id: recipientId },
    message: {
      text,
      quick_replies: replies.slice(0, 13).map((title) => ({
        content_type: "text",
        title: title.slice(0, 20),
        payload: title,
      })),
    },
  });
}

export async function replyToComment(commentId: string, message: string) {
  const res = await fetch(
    `${GRAPH_BASE}/${commentId}/replies?access_token=${getAccessToken()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Instagram Graph API error (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return data;
}

/**
 * Valida a assinatura X-Hub-Signature-256 enviada pela Meta em cada webhook,
 * usando o App Secret. Evita processar eventos forjados por terceiros.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) return false;
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signatureHeader.replace("sha256=", "");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(received, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
