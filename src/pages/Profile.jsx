import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const auth = getAuth()
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const navigate = useNavigate()
  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  return (
    <div className="profile">
      <div className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
