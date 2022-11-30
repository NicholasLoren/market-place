import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'

import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import Oauth from '../components/Oauth'

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const onChange = (e) => {
    const { id, value } = e.target

    setFormData({
      ...formData,
      [id]: value,
    })
  }

  //Initialise use navigate
  const navigate = useNavigate()

  const { name, email, password } = formData

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      const auth = getAuth()
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      updateProfile(auth.currentUser, {
        displayName: name,
      })
      //Saving a new user to our database
      const formDataCopy = { ...formData }
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      setDoc(doc(db, 'users', user.uid), formDataCopy)

      navigate('/')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }
  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Sign Up!</p>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="name"
              id="name"
              className="nameInput"
              placeholder="Name"
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              name="email"
              id="email"
              className="emailInput"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />
            <div className="passwordInputDiv">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                className="passwordInput"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
              <img
                src={visibilityIcon}
                alt="Show Password"
                className="showPassword"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>

            <div className="signUpBar">
              <p className="signUpText">Sign Up</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#fff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          <Oauth />
          <Link to="/sign-in" className="registerLink">
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignUp
