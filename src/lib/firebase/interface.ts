import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, User } from "firebase/auth"
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
import { getDatabase, push, ref, onChildAdded } from '@firebase/database'
import { FirebaseError } from "firebase/app"
import { Dispatch, SetStateAction } from "react"
import { initializeFirebaseApp } from "./firebase"

export interface ChatMessage {
  id: string
  message: string,
  sender: string
}

export interface Room {
  id: string
  name: string,
  users: User[]
}

export const getCurrentUserRooms = async (currentUser: User) => {
  const db = getFirestore()
  const q = query(collection(db, "rooms"), where("users", "array-contains", currentUser?.uid))

  const ss = await getDocs(q)
  const rooms: Room[] = []
  ss.forEach((doc) => {
    const data = doc.data()
    const room: Room = { id: doc.id, name: data.name, users: data.users }
    rooms.push(room)
  })
  return rooms
}

export const createRoom = async (
  name: string,
  currentUser: User,
  onSuccess?: Function,
  onFail?: Function
) => {
  try {
    const db = getFirestore()
    addDoc(collection(db, "rooms"), {
      name: name,
      users: [currentUser?.uid]
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const getRoom = async (id: string) : Promise<Room | null> => {
  try {
    const db = getFirestore()
    const document = await getDoc(doc(db, `rooms/${id}`))
    // 存在確認
    if (!document.exists()) {
      return null
    }
    const data = document.data()
    return { id: document.id, name: data?.name, users: data?.users }
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.error(e)
    }
    return null
  }
}

export const sendMessage = async (
  room: Room,
  message: string,
  currentUser: User,
  onSuccess?: Function,
  onFail?: Function
) => {
  try {
    const db = getDatabase()
    const dbRef = ref(db, `rooms/${room.id}/chat`)
    await push(dbRef, {
      message: message,
      sender: currentUser?.uid
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const getMessageListener = (room: Room, setMessages: Dispatch<SetStateAction<ChatMessage[]>>) => {
  try {
    const db = getDatabase()
    const dbRef = ref(db, `rooms/${room.id}/chat`)

    return onChildAdded(dbRef, (snapshot) => {
      const value = snapshot.val()
      setMessages((prev) => [
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
}

export const login = async (
  email: string,
  password: string,
  onSuccess?: Function,
  onFail?: Function
) => {
  initializeFirebaseApp()
  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const signup = async (
  email: string,
  password: string,
  password2: string,
  onInvalid?: Function,
  onSuccess?: Function,
  onFail?: Function
) => {
  if (password !== password2) {
    onInvalid?.()
    return
  }
  initializeFirebaseApp()
  try {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    await sendEmailVerification(userCredential.user)
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.()
  }
}

export const updateUserInfo = async (
  email: string,
  password: string,
  password2: string,
  onInvalid?: Function,
  onSuccess?: Function,
  onFail?: Function
) => {
  if (password !== password2) {
    onInvalid?.()
    return
  }
  initializeFirebaseApp()
  try {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    await sendEmailVerification(userCredential.user)
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.()
  }
}