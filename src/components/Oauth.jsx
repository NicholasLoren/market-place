import { useLocation, useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './../firebase.config'
import { toast } from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

function Oauth() {
  const navigate = useNavigate()
  const location = useLocation()

  const onGoogleClick = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      //Create a user reference from the database
      const userRef = doc(db, 'users', result.user.uid)
      //create a snapshot of the user from the db
      const userSnap = await getDoc(userRef)

      //check if the user exists doesnot exist
      if (!userSnap.exists()) {
        //save user to the database
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          timestamp: serverTimestamp(),
        })
      }
      navigate('/')
    } catch (error) {
      toast.error('Could not authourize with Google')
    }
  }
  return (
    <div className="socialLogin">
      <p>Sign {location.pathname === '/sign-up' ? 'Up' : 'In'} with</p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img src={googleIcon} alt="google" className="socialIconImg" />
      </button>
    </div>
  )
}

export default Oauth
