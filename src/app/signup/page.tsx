"use client"

import { FormEvent, useState } from "react"
import { FirebaseError } from '@firebase/util'
import { signup } from "@/lib/firebase/interface"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertClass, setAlertClass] = useState("alert-error")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    signup(email, password, password2,
      () => {
        setPassword('')
        setPassword2('')
        setAlertMessage("Passwords does not match.")
        setAlertClass("alert-success")
        setShowAlert(true)
      },
      () => {
        setEmail('')
        setPassword('')
        setPassword2('')
        setAlertMessage(`Verification Email has sent to ${email}.`)
        setAlertClass("alert-success")
        setShowAlert(true)
      },
      (e: unknown) => {
        setPassword('')
        setPassword2('')
        setShowAlert(true)
        if (e instanceof FirebaseError) {
          setAlertMessage(e.message)
        }
        setAlertClass("alert-error")
      }
    )
  }

  return (
  <div className="relative flex flex-col justify-center h-screen overflow-hidden">
    <div className="w-full space-y-4 p-6 m-auto bg-white rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-700">Sign Up</h1>
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
        <div>
          <label className="label">
            <span className="text-base label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
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
        showAlert &&
        <div
          role="alert"
          className={`alert ${alertClass}`}
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
  </div>
  )
}