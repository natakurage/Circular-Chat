export function AvatarCircle() {
  const scale = 0.8
  const users = [1, 2, 3, 4, 5, 6]
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
              key={user}
              className={`border rounded-full absolute`}
              style={{ top: `${50 * y}%`, left: `${50 * x}%`, transform: "translate(-50%, -50%)" }}
            >
              { user }
            </div>
          )
        })
      }
      </div>
    </div>
  )
}

