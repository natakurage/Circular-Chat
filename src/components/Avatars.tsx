import { ChatMessage } from "@/lib/firebase/interface"
import { User } from "firebase/auth"

export function AvatarCircle({ users, messages }: { users: User[], messages: ChatMessage[] }) {
  const scale = 0.8
  return (
    <div
      className="relative border w-full aspect-square"
    >
      <div
        className="w-full h-full"
        style={{ transform: "translate(50%, 60%)" }}
      >
      {
        users.map((user, idx) => {
          const x = scale * Math.cos(2 * Math.PI * idx / users.length)
          const y = scale * Math.sin(2 * Math.PI * idx / users.length)
          return (
            <div
              key={user.uid}
              className={`border rounded-full absolute`}
              style={{ top: `${50 * y}%`, left: `${50 * x}%`, transform: "translate(-50%, -50%)" }}
            >
              { user.uid }: { user.displayName }
            </div>
          )
        })
      }
      </div>
    </div>
  )
}

