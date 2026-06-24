import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getSession } from "@/lib/auth-server"

const f = createUploadthing()

export const ourFileRouter = {
  avatarUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new Error("No autorizado")
      return { userId: session.userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { query } = await import("@/lib/db")
      await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [file.ufsUrl, metadata.userId])
    }),

  teamBadge: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new Error("No autorizado")
      return { userId: session.userId }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  postImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
  })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new Error("No autorizado")
      return { userId: session.userId }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
