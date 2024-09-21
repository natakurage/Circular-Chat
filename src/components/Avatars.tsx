import { ChatMessage, Room, UserData } from "@/lib/firebase/interface"
import { useEffect, useState } from "react"

function Message({ messages, limit = 5, overlapX = 0, overlapY = 30 } : { messages: ChatMessage[], limit?: number, overlapX?: number, overlapY?: number }) {
  const numMessages = Math.min(messages.length, limit)
  const [foregroundIdx, setForegroundIdx] = useState(numMessages - 1)

  useEffect(() => {
    setForegroundIdx(numMessages - 1)
  }, [numMessages])

  return (
    <ul>
    {
      messages.map((message, idx) => {
        const index = idx - (messages.length - numMessages)
        if (index < 0) {
          return
        }
        return (
          <li
            key={index}
            className={
              "border rounded "
              + "text-sm "
              + "transition-[top,opacity] "
              + "absolute shadow-lg p-2 w-64 min-h-48 "
              + "bg-white text-gray-700 "
            }
            style={{
              top: `${-overlapY * index + (index > foregroundIdx ? -20 : 0)}%`,
              left: `${-overlapX * index + 50}%`,
              transform: "translate(-50%, -100%)",
              zIndex: index == foregroundIdx ? 9999: index,
              opacity: index == foregroundIdx ? 1 : 0.1 + index / (numMessages + 50)
            }}
              onMouseEnter={() => setForegroundIdx(index)}
              onMouseLeave={() => setForegroundIdx(numMessages - 1)}
          >
            {message.message}
          </li>
        )
      })
    }
    </ul>
  )
}

export function AvatarCircle({ room, messages, currentUser }: { room: Room, messages: ChatMessage[], currentUser: UserData | null }) {
  const scale = 0.8

  const messageMap = new Map<string, ChatMessage[]>()
  for (const message of messages) {
    if (message.sender == null) {
      continue
    }
    let messageArray = messageMap.get(message.sender.id)
    if (messageArray == null) {
      messageArray = [message]
    } else {
      messageArray = [...messageArray, message]
    }
    messageMap.set(message.sender.id, messageArray)
  }
  console.log(messageMap)

  return (
    <div
      className="relative border w-full aspect-square"
    >
      <div
        className="w-full h-full"
        style={{ transform: "translate(50%, 60%)" }}
      >
      {
        room.users.map((user, idx) => {
          const t = idx / (room.users.length - 1)
          const u = room.users.length > 2 ? (0.7 * t + 0.4) : (0.5 * t + 0.5)
          const theta = 2 * Math.PI * u
          const x = scale * Math.cos(theta)
          const y = -scale * Math.sin(theta)
          return (
            <div
              key={user.id}
              className={
                "border rounded-full absolute p-5 text-gray-700 "
                + (currentUser?.id == user.id ? "bg-green-500 " : "bg-white ")
              }
              style={{ top: `${50 * y}%`, left: `${50 * x}%`, transform: "translate(-50%, -50%)" }}
            >
              { user.displayName }
              <Message messages={messageMap.get(user.id) ?? []} />
            </div>
          )
        })
      }
      </div>
    </div>
  )
}

