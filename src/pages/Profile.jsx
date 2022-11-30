import { useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import ArrowRightIcon from '../assets/svg/keyboardArrowRightIcon.svg'
import HomeIcon from '../assets/svg/homeIcon.svg'

const Profile = () => {
  const auth = getAuth()
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const [changeDetails, setChangeDetails] = useState(false)
  const navigate = useNavigate()
  const { name, email } = formData
  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const onSubmit = async (e) => {
    try {
      if (auth.currentUser.displayName !== name) {
        //update display name from firestore
        await updateProfile(auth.currentUser, { displayName: name })
        //get user reference for the database
        const userRef = doc(db, 'users', auth.currentUser.uid)
        //update the name in firestore db
        await updateDoc(userRef, { name })

        toast.success('Changes saved')
      }
    } catch (error) {
      toast.error('Could not update details')
    }
  }

  const onChange = (e) => {
    const { id, value } = e.target
    setFormData((prevState) => ({ ...prevState, [id]: value }))
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" onClick={onLogout}>
          Log Out
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit()
              setChangeDetails((prevState) => !prevState)
            }}
          >
            {changeDetails ? 'Done' : 'ChangeDetails'}
          </p>
        </div>

        <div className="profrleCard">
          <form>
            <input
              type="text"
              id="name"
              className={changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              onChange={onChange}
              value={name}
            />
            <input
              type="text"
              id="email"
              className={changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              onChange={onChange}
              value={email}
            />
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={HomeIcon} alt="Home" />
          <p>Sell or rent your home</p>
          <img src={ArrowRightIcon} alt="arrow right" />
        </Link>
      </main>
    </div>
  )
}

export default Profile
