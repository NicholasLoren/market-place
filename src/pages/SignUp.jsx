import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

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
  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Sign Up!</p>
        </header>
        <main>
          <form>
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

            {/* <Link to="/forgot-password" className="forgotPasswordLink">
              forgot password
            </Link> */}

            <div className="signUpBar">
              <p className="signUpText">Sign Up</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#fff" width="34px" height="34px" />
              </button>
            </div>
          </form>
          {/* Google Oauth */}
          <Link to="/sign-in" className="registerLink">
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignUp
