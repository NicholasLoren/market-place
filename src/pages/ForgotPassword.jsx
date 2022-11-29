import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')

  const onChange = (e) => setEmail(e.target.value)
  const onSubmit = async (e) => {
    e.preventDefault()
    const auth = getAuth()
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset link sent successfully')
      setEmail('')
    } catch (error) {
      toast.error('Could not send reset password link')
    }
  }
  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Forgot Password</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            id="email"
            className="emailInput"
            onChange={onChange}
            value={email}
          />

          <Link className="forgotPasswordLink" to="/sign-in">
            Sign In
          </Link>
          <div className="signInBar">
            <div className="signInText">Reset Password</div>
            <button className="signInButton">
              <ArrowRightIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ForgotPassword
