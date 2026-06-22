let _pusher: any = null

export function getPusherClient() {
  if (typeof window === "undefined") return null
  if (_pusher) return _pusher

  const Pusher = require("pusher-js")
  _pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  })
  return _pusher
}
