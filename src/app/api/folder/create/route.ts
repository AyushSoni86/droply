import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const POST = async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { name, parentId = null, userId: bodyUserId } = body;

    // Verify the user is uploading to their own account
    if (bodyUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate folder name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid folder name" },
        { status: 400 }
      );
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.isFolder, true)
          )
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }

      const folderData = {
        id: uuidv4(),
        name: name.trim(),
        path: `folders/${userId}/${uuidv4()}`,
        size: 0,
        type: "folder",
        fileUrl: "",
        userId,
        parentId,
        isFolder: true,
        isStarred: false,
        isTrash: false,
      };

      const [newFolder] = await db.insert(files).values(folderData).returning();

      return NextResponse.json({
        success: true,
        message: "Folder created successfully",
        folder: newFolder,
      });
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
};
