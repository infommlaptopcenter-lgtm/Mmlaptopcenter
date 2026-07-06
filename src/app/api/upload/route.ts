import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "mmlaptop-center");
    const usedIn = String(formData.get("usedIn") || "general");
    const referenceId = String(formData.get("referenceId") || "");
    const alt = String(formData.get("alt") || "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadImage(buffer, folder);

    const media = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        url: result.url,
        publicId: result.publicId,
        type: file.type || "image",
        size: result.bytes,
        alt: alt || null,
        usedIn,
        referenceId: referenceId || null,
      },
    });

    return NextResponse.json({
      secure_url: result.url,
      url: result.url,
      publicId: result.publicId,
      media,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}

