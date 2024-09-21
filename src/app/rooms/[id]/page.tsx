"use client"

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { FirebaseError } from '@firebase/util'
import RoomList from "@/components/RoomList";
import { AvatarCircle } from "@/components/Avatars";
import { ChatMessage, createInvitationCode, getCurrentUser, getMessageListener, getRoom, leaveRoom, Room, sendMessage, UserData } from "@/lib/firebase/interface";

export default function ChatRoom({ params }: { params: { id: string } }) {
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [AlertClass, setAlertClass] = useState("alert-error")

  const router = useRouter()
  useEffect(() => {
    getCurrentUser(() => {}, setCurrentUserData, () => { router.push("/") })
  }, [router])

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
  }, [room])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (room == null || currentUserData == null) {
      return
    }
    sendMessage(room, chatMessage, currentUserData,
      () => setChatMessage(""),
      (e: unknown) => {
        setShowAlert(true)
        if (e instanceof FirebaseError) {
          setAlertMessage(e.message)
        }
        setAlertClass("alert-error")
      }
    )
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (room == null) {
      return
    }
    const code = await createInvitationCode(room,
      () => {},
      (e: unknown) => {
        setShowAlert(true)
        if (e instanceof FirebaseError) {
          setAlertMessage(e.message)
        }
        setAlertClass("alert-error")
      }
    )
    if (code == null) {
      return
    }
    alert(`Created invitation code: ${code.code} (expires at ${code.expires.toDate().toLocaleString()})`)
  }

  const handleLeave = async (e: FormEvent) => {
    e.preventDefault()
    if (room == null || currentUserData == null) {
      return
    }
    leaveRoom(room, currentUserData,
      () => {
        console.log("successfully left the room")
        router.push("/")
      },
      (e: unknown) => {
        setShowAlert(true)
        if (e instanceof FirebaseError) {
          setAlertMessage(e.message)
        }
        setAlertClass("alert-error")
      }
    )
  }

  return (
    <div className="flex flex-row">
      <div className="">
        <RoomList currentUser={currentUserData}/>
      </div>
      <main className="flex-1 flex flex-col gap-8 row-start-2 items-center overflow-hidden sm:items-start">
        <h1 className="text-7xl w-full my-3 text-center">Room {room?.name}</h1>
        <div className="m-auto">
        <button className="btn btn-primary" onClick={handleInvite}>Invite</button>
        <button className="btn btn-error" onClick={()=>(document.getElementById('my_modal_1') as HTMLDialogElement)?.showModal()}>Leave</button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Leave</h3>
            <p className="py-4">Are you sure to leave from Room {room?.name}?</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleLeave}>leave</button>
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
        </div>
        <div className="w-full max-w-xl m-auto">
          {
            room && <AvatarCircle room={room} messages={messages} currentUser={currentUserData} />
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
