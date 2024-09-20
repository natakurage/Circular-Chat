"use client"

import RoomList from "@/components/RoomList";
import { initializeFirebaseApp } from "@/lib/firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
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

  return (
    <div className="flex flex-row">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        { currentUser?.email }
        <RoomList currentUser={currentUser} />
      </main>
    </div>
  );
}
