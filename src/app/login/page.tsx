"use client"

import { FormEvent, useState } from "react"
import {
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth'
import { FirebaseError } from '@firebase/util'
import { initializeFirebaseApp } from "@/lib/firebase/firebase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [messageClass, setMessageClass] = useState("alert-error")
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    initializeFirebaseApp()
    try {
      const auth = getAuth()
      
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      router.push("/")
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
        setMessageClass("alert-error")
        setMessage(e.message)
        setShowMessage(true)
      }
    }
  }

  return (
  <div className="relative flex flex-col justify-center h-screen overflow-hidden">
    <div className="w-full space-y-4 p-6 m-auto bg-white rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-700">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full input input-bordered"
          />
        </div>
        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full input input-bordered"
          />
        </div>
        <a href="#" className="text-xs text-gray-600 hover:underline hover:text-blue-600">Already have account? Login</a>
        <div>
          <button className="btn-neutral btn btn-block">Login</button>
        </div>
      </form>
      {
        showMessage &&
        <div
          role="alert"
          className={`alert ${messageClass}`}
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
          <span>{ message }</span>
        </div>
      }
    </div>
  </div>
  )
}