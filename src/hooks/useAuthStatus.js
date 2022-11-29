import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkStatus, setCheckStatus] = useState(true)
  const auth = getAuth()
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true)
        }

        setCheckStatus(false)
      })
    }

    return () => (isMounted.current = false)
  }, [])

  return { loggedIn, checkStatus }
}
