import { NextRequest, NextResponse } from "next/server";
import { handleIncomingEvent } from "@/lib/flowEngine";
import { verifyWebhookSignature } from "@/lib/instagram";

/**
 * Handshake de verificação exigido pela Meta ao configurar o webhook
 * (Developer Console > Webhooks > Instagram).
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "verification failed" }, { status: 403 });
}

interface WebhookEntry {
  messaging?: {
    sender?: { id?: string };
    message?: { text?: string; is_echo?: boolean };
  }[];
  changes?: {
    field: string;
    value: {
      id?: string;
      text?: string;
      from?: { id?: string };
    };
  }[];
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { entry?: WebhookEntry[] };

  for (const entry of payload.entry ?? []) {
    for (const messaging of entry.messaging ?? []) {
      if (messaging.message?.is_echo) continue;
      const senderId = messaging.sender?.id;
      const text = messaging.message?.text;
      if (senderId && text) {
        await handleIncomingEvent({ kind: "message", senderId, text });
      }
    }

    for (const change of entry.changes ?? []) {
      if (change.field !== "comments") continue;
      const commentId = change.value.id;
      const commenterId = change.value.from?.id;
      const text = change.value.text;
      if (commentId && commenterId && text) {
        await handleIncomingEvent({
          kind: "comment",
          commentId,
          commenterId,
          text,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
