"use client"

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { initializeFirebaseApp } from "@/lib/firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, push, ref, onChildAdded, get } from '@firebase/database'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc
} from '@firebase/firestore'
import { FirebaseError } from '@firebase/util'
import RoomList from "@/components/RoomList";

interface ChatMessage {
  id: string
  message: string,
  sender: string
}

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [roomName, setRoomName] = useState("")
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
    const checkRoomExists = async () => {
      try {
        const db = getFirestore()
        const document = await getDoc(doc(db, `rooms/${params.id}`))
        // where("users", "array-contains", currentUser?.uid)
        // 存在確認
        if (!document.exists()) {
          router.push("/404")
        }
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.error(e)
        }
        return
      }
    }
    checkRoomExists()
  }, [params.id, router])

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, `rooms/${params.id}/chat`)

      return onChildAdded(dbRef, (snapshot) => {
        const value = snapshot.val()
        setChats((prev) => [
          ...prev,
          {
            id: snapshot.key ?? "",
            message: value.message,
            sender: value.sender,
          },
        ])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
  }, [params.id, router])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const db = getDatabase()
      const dbRef = ref(db, `rooms/${params.id}/chat`)
      await push(dbRef, {
        message: chatMessage,
        sender: currentUser?.uid
      })
      setChatMessage("")
      // setAlertClass("alert-success")
      // setAlertMessage("Message sent")
      // setShowAlert(true)
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
        setAlertClass("alert-error")
        setAlertMessage(e.message)
        setShowAlert(true)
      }
    }
  }

  return (
    <div className="flex flex-row">
      <RoomList currentUser={currentUser}/>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        { currentUser?.email }
        <ul>
        {
          chats.map((chat) => (
            <li key={chat.id}>
              {chat.sender}: {chat.message}
            </li>
          ))
        }
        </ul>
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
