"use client"

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { initializeFirebaseApp } from "@/lib/firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, push, ref, onChildAdded } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
import RoomList from "@/components/RoomList";
import { AvatarCircle } from "@/components/Avatars";
import { ChatMessage, getMessageListener, getRoom, Room, sendMessage } from "@/lib/firebase/interface";

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [AlertClass, setAlertClass] = useState("alert-error")

  const router = useRouter()
  useEffect(() => {
    initializeFirebaseApp()
    return onAuthStateChanged(getAuth(), (user: User | null) => {
      setCurrentUser(user)
      // console.log(user)
      if (user === null) {
        router.push("/login")
      }
    })
  })

  useEffect(() => {
    (async () => {
      const room = await getRoom(params.id)
      if (room == null) {
        router.push("/404")
      }
      setRoom(room)
    })()
  }, [params.id, router])

  useEffect(() => {
    if (room == null) {
      return
    }
    return getMessageListener(room, setMessages)
  }, [])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (room == null || currentUser == null) {
      return
    }
    sendMessage(room, chatMessage, currentUser,
      () => setChatMessage(""),
      (e: FirebaseError) => {
        setShowAlert(true)
        setAlertMessage(e.message)
        setAlertClass("alert-error")
      }
    )
  }

  return (
    <div className="flex flex-row">
      <div className="">
        <RoomList currentUser={currentUser}/>
      </div>
      <main className="flex-1 flex flex-col gap-8 row-start-2 items-center sm:items-start">
        { currentUser?.email }
        <ul>
        {
          messages.map((chat) => (
            <li key={chat.id}>
              {chat.sender}: {chat.message}
            </li>
          ))
        }
        </ul>
        <div className="w-full max-w-xl m-auto">
          {
            room && <AvatarCircle users={room.users} messages={messages} />
          }
        </div>
        <div className="w-full space-y-4 p-6 m-auto bg-white rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-700">Send message</h1>
          <form
            onSubmit={handleSendMessage}
            className="space-y-4"
          >
            <div>
              <label className="label">
                <span className="text-base label-text">Message</span>
              </label>
              <textarea
                required
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Chat Message"
                className="w-full input input-bordered"
              />
            </div>
            <div>
              <button className="btn-neutral btn btn-block">Submit</button>
            </div>
          </form>
          {
            showAlert &&
            <div
              role="alert"
              className={`alert ${AlertClass}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{ alertMessage }</span>
            </div>
          }
        </div>
      </main>
    </div>
  );
}
