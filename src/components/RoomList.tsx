import { FormEvent, useCallback, useEffect, useState } from "react";
import { createRoom, getCurrentUserRooms, Room, updateUserInfo, UserData } from "@/lib/firebase/interface";

export default function RoomList({ currentUser }: { currentUser: UserData | null }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomName, setRoomName] = useState("")
  const [displayName, setDisplayName] = useState("")

  const fetchRooms = useCallback(async () => {
    if (currentUser == null) {
      return
    }
    setRooms(await getCurrentUserRooms(currentUser))
  }, [currentUser])

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault()
    if (currentUser == null) {
      return
    }
    await createRoom(roomName, currentUser,
      () => {
        setRoomName("")
        fetchRooms()
      }
    )
  }

  const handleNameUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (currentUser == null) {
      return
    }
    await updateUserInfo(currentUser, displayName, undefined, 
      () => {
        setDisplayName(currentUser?.displayName ?? "")
      }
    )
  }

  useEffect(() => {
    fetchRooms()
    setDisplayName(currentUser?.displayName ?? "")
  }, [currentUser, fetchRooms])

  return (
    <ul className="menu bg-base-200 rounded-box w-56 h-full">
      <li className="menu-title">Chat Rooms</li>
      {
        rooms.map((room) => (
          <li key={room.id}>
            <a href={`/rooms/${room.id}`}>{room.name}</a>
          </li>
        ))
      }
      <li className="dropdown">
        <div tabIndex={0}>+ Open Room</div>
        <form
          onSubmit={handleCreateRoom}
          className="dropdown-content bg-base-100 w-full p-0 z-[1] shadow"
        >
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            tabIndex={0}
            placeholder="Enter Room Name"
            className="block bg-base-100 z-[1] w-full h-full shadow p-0"
          />
          <button className="btn-neutral btn btn-block">+</button>
        </form>
      </li>
      <li className="menu-title">Change Name</li>
      <li>
        <form
            onSubmit={handleNameUpdate}
            className="dropdown-content bg-base-100 w-full p-0 z-[1] shadow"
          >
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            tabIndex={0}
            placeholder="Enter Your Name"
            className="block bg-base-100 z-[1] w-full h-full shadow p-0"
          />
          <button className="btn-neutral btn btn-block">+</button>
        </form>
      </li>
  </ul>
)

}