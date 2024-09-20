import { FormEvent, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from '@firebase/firestore'
import { FirebaseError } from '@firebase/util'

interface Room {
  id: string
  name: string
}

export default function RoomList({ currentUser }: { currentUser: User | null }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomName, setRoomName] = useState("")

  const fetchRooms = async () => {
    if (currentUser?.uid == null) {
      return
    }
    const db = getFirestore()
    const q = query(collection(db, "rooms"), where("users", "array-contains", currentUser?.uid))

    const ss = await getDocs(q)
    const rooms: Room[] = []
    ss.forEach((doc) => {
      const data = doc.data()
      const room: Room = { id: doc.id, name: data.name }
      rooms.push(room)
    })
    setRooms(rooms)
  }

  useEffect(() => {
    fetchRooms()
  }, [currentUser?.uid])

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const db = getFirestore()
      addDoc(collection(db, "rooms"), {
        name: roomName,
        users: [currentUser?.uid]
      })
      setRoomName("")
      // setAlertClass("alert-success")
      // setAlertMessage("Message sent")
      // setShowAlert(true)
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
    fetchRooms()
  }

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
  </ul>
)

}