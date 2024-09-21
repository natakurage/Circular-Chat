"use client"

import RoomList from "@/components/RoomList";
import { getCurrentUser, UserData } from "@/lib/firebase/interface";
import {  User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    getCurrentUser(setCurrentUser, setCurrentUserData, () => { router.push("/") })
  }, [router])

  return (
    <div className="flex flex-row">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        { currentUser?.email }
        <RoomList currentUser={currentUserData} />
      </main>
    </div>
  );
}
