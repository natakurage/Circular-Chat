"use client"

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { initializeFirebaseApp } from "@/lib/firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, push, ref, onChildAdded } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

interface ChatMessage {
  id: string
  message: string
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [chatMessage, setChatMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [AlertClass, setAlertClass] = useState("alert-error")

  const router = useRouter()
  useEffect(() => {
    initializeFirebaseApp()
    return onAuthStateChanged(getAuth(), (user: User | null) => {
      setCurrentUser(user)
      console.log(user)
      if (user === null) {
        router.push("/login")
      }
    })
  })

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      return onChildAdded(dbRef, (snapshot) => {
        const value = snapshot.val()
        setChats((prev) => [...prev, { id: snapshot.key ?? "", message: value.message }])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
  }, [])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      await push(dbRef, {
        message: chatMessage,
      })
      setChatMessage("")
      setAlertClass("alert-success")
      setAlertMessage("Message sent")
      setShowAlert(true)
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        { currentUser?.email }
        <ul>
        {
          chats.map((chat) => (
            <li key={chat.id}>
              {chat.message}
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
