import { ChatMessage, Room } from "@/lib/firebase/interface"

export function AvatarCircle({ room, messages }: { room: Room, messages: ChatMessage[] }) {
  const scale = 0.8
  const limit = 2

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
          const x = scale * Math.cos(2 * Math.PI * idx / room.users.length)
          const y = scale * Math.sin(2 * Math.PI * idx / room.users.length)
          return (
            <div
              key={user.id}
              className={`border rounded-full absolute p-5`}
              style={{ top: `${50 * y}%`, left: `${50 * x}%`, transform: "translate(-50%, -50%)" }}
            >
              { user.displayName }
              <ul>
              {
                messageMap.get(user.id)?.map((message, idx2) => idx2 > limit && (
                  <li
                    key={ message.id }
                    className="border bg-white text-gray-700 rounded absolute p-2 min-w-24"
                    style={{ top: `${-50 * (idx2 - limit)}%`, left: "50%", transform: "translate(-50%, -50%)" }}
                  >
                    {message.message}
                  </li>
                ))
              }
              </ul>
            </div>
          )
        })
      }
      </div>
    </div>
  )
}

