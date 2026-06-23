import type PusherTypes from "pusher-js"

let _pusher: PusherTypes | null = null

export function getPusherClient(): PusherTypes | null {
  if (typeof window === "undefined") return null
  if (_pusher) return _pusher

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Pusher = require("pusher-js") as typeof PusherTypes
  _pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  })
  return _pusher
}
