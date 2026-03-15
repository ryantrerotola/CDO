import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";
import { seedDefaultPodcasts } from "@/lib/podcast";

const GRADIENTS = [
  "from-purple-500 to-blue-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-blue-500 to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-blue-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
];

// GET — list user's tracked podcasts
export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  let podcasts = await prisma.trackedPodcast.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  // Auto-seed defaults on first access
  if (podcasts.length === 0) {
    await seedDefaultPodcasts(userId);
    podcasts = await prisma.trackedPodcast.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  return NextResponse.json(podcasts);
}

// POST — add a podcast by Spotify show ID
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await request.json();
  const { name, spotifyShowId, relevance } = body;

  if (!name || !spotifyShowId) {
    return NextResponse.json(
      { error: "name and spotifyShowId are required" },
      { status: 400 }
    );
  }

  // Pick a gradient based on how many they already have
  const count = await prisma.trackedPodcast.count({ where: { userId } });
  const gradient = GRADIENTS[count % GRADIENTS.length];

  const podcast = await prisma.trackedPodcast.upsert({
    where: { userId_spotifyShowId: { userId, spotifyShowId } },
    update: { name, relevance: relevance || null },
    create: {
      userId,
      name,
      spotifyShowId,
      gradient,
      relevance: relevance || null,
    },
  });

  return NextResponse.json(podcast, { status: 201 });
}

// DELETE — remove a tracked podcast
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Verify ownership
  const podcast = await prisma.trackedPodcast.findFirst({
    where: { id, userId },
  });

  if (!podcast) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trackedPodcast.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
