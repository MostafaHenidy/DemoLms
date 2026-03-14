/**
 * Standalone WebSocket server for real-time chat.
 * Run: node scripts/chat-socket-server.js
 * Next.js API calls CHAT_SOCKET_URL/notify-message after saving a message so this server can broadcast to clients.
 */
const http = require("http")
const { Server } = require("socket.io")

const PORT = parseInt(process.env.CHAT_SOCKET_PORT || "3001", 10)

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/notify-message") {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      try {
        const { conversationId, message } = JSON.parse(body)
        if (conversationId != null && message) {
          io.to(`conv-${conversationId}`).emit("new_message", message)
        }
      } catch (e) {
        console.error("notify-message parse error", e.message)
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ ok: true }))
    })
    return
  }
  res.writeHead(404)
  res.end()
})

const io = new Server(server, {
  cors: { origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", methods: ["GET", "POST"] },
})

io.on("connection", (socket) => {
  socket.on("join_conversation", (data) => {
    const id = data?.conversationId
    if (id != null) socket.join(`conv-${id}`)
  })
  socket.on("leave_conversation", (data) => {
    const id = data?.conversationId
    if (id != null) socket.leave(`conv-${id}`)
  })
})

server.listen(PORT, () => {
  console.log(`Chat socket server on http://localhost:${PORT}`)
})
