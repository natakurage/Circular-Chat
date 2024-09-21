import {
  User,
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp
} from '@firebase/firestore'
import { getDatabase, push, ref, onChildAdded } from '@firebase/database'
import { FirebaseError } from "firebase/app"
import { Dispatch, SetStateAction } from "react"
import { initializeFirebaseApp } from "./firebase"

export interface UserData {
  id: string,
  displayName: string
}

export interface ChatMessage {
  id: string
  message: string,
  sender: UserData | null
}

export interface Room {
  id: string
  name: string,
  users: UserData[]
}

export interface InvitationCode {
  code: string,
  roomId: string,
  expires: Timestamp
}

export const getCurrentUserRooms = async (currentUser: UserData) => {
  const db = getFirestore()
  const q = query(collection(db, "rooms"), where("users", "array-contains", currentUser?.id))

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
  currentUser: UserData,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  try {
    const db = getFirestore()
    addDoc(collection(db, "rooms"), {
      name: name,
      users: [currentUser?.id]
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
    const userIds: string[] = data?.users
    let users: UserData[] = []
    if (userIds != null) {
      const nullableUsers = await Promise.all(userIds.map(async (userId) => {
        return await getUserData(userId)
      }))
      users = nullableUsers.filter(user => user != null)
    }
    return { id: document.id, name: data?.name, users }
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
  currentUser: UserData,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  try {
    const db = getDatabase()
    const dbRef = ref(db, `rooms/${room.id}/chat`)
    await push(dbRef, {
      message: message,
      sender: currentUser?.id
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

    return onChildAdded(dbRef, async (snapshot) => {
      const value = snapshot.val()
      const sender = await getUserData(value.sender)
      setMessages((prev) => [
        ...prev,
        {
          id: snapshot.key ?? "",
          message: value.message,
          sender,
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
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
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
  onInvalid?: () => void,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
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
    await createUserData(userCredential.user, `user-${userCredential.user.uid}`)
    await sendEmailVerification(userCredential.user)
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const getUserData = async (id: string) : Promise<UserData | null> => {
  try {
    const db = getFirestore()
    const document = await getDoc(doc(db, `users/${id}`))
    // 存在確認
    if (!document.exists()) {
      return null
    }
    const data = document.data()
    return { id: document.id, displayName: data?.displayName }
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.error(e)
    }
    return null
  }
}

export const getCurrentUser = async (
  setUser: Dispatch<SetStateAction<User | null>>,
  setUserData: Dispatch<SetStateAction<UserData | null>>,
  onNotFound?: () => void
) => {
  initializeFirebaseApp()
  return onAuthStateChanged(getAuth(), async (user: User | null) => {
    setUser(user)
    if (user === null) {
      onNotFound?.()
      return
    }
    const userData = await getUserData(user.uid)
    if (userData == null) {
      await createUserData(user, `user-${user.uid}`)
      return
    }
    setUserData(userData)
  })
}

export const createUserData = async (
  user: User,
  displayName: string,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  try {
    const db = getFirestore()
    setDoc(doc(db, "users", user.uid), {
      displayName
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const updateUserInfo = async (
  user: UserData,
  displayName?: string,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  try {
    const db = getFirestore()
    updateDoc(doc(db, "users", user.id), {
      displayName
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const createInvitationCode = async (
  room: Room,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) : Promise<InvitationCode | undefined> => {
  const roomId = room.id
  const expires = Timestamp.fromDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
  try {
    const db = getFirestore()
    const ref = await addDoc(collection(db, "invites"), {
      roomId, expires
    })
    onSuccess?.()
    return { code: ref.id, roomId, expires }
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const leaveRoom = async (
  room: Room,
  user: UserData,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  const r = await getRoom(room.id)
  if (r == null) {
    onFail?.(0)
    return
  }
  const users = r.users
  const newUsers = users?.filter((u) => u.id != user.id)
  try {
    const db = getFirestore()
    updateDoc(doc(db, "rooms", room.id), {
      users: newUsers
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const joinRoom = async (
  code: string,
  currentUser: UserData,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  let roomId: string | null = null
  try {
    const db = getFirestore()
    const document = await getDoc(doc(db, `invites/${code}`))
    // 存在確認
    if (!document.exists()) {
      onFail?.(0)
      return
    }
    const data = document.data()
    // 日付確認
    if (data?.expires > Timestamp.fromDate(new Date)) {
      onFail?.(0)
      return
    }
    roomId = data.roomId
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.error(e)
    }
    onFail?.(0)
    return
  }
  if (roomId == null) {
    onFail?.(0)
    return
  }
  const room = await getRoom(roomId)
  if (room == null) {
    onFail?.(0)
    return
  }
  const users = room.users
  users.push(currentUser)
  try {
    const db = getFirestore()
    updateDoc(doc(db, "rooms", room.id), {
      users
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}

export const updateRoomInfo = async (
  room: Room,
  name: string,
  onSuccess?: () => void,
  onFail?: (e: unknown) => void
) => {
  const r = await getRoom(room.id)
  if (r == null) {
    onFail?.(0)
    return
  }
  try {
    const db = getFirestore()
    updateDoc(doc(db, "rooms", room.id), {
      name
    })
    onSuccess?.()
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
    onFail?.(e)
  }
}
