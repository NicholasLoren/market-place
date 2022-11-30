import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Spinner from '../components/Spinner.jsx'

function CreateListing() {
  //Initialize our state for the form

  const [formData, setFormData] = useState({
    name: '',
    type: 'rent',
    bathrooms: 1,
    bedrooms: 1,
    furnished: false,
    parking: false,
    latitude: 0,
    longitude: 0,
    images: {},
    regularPrice: 0,
    discountPrice: 0,
    timestamp: '',
    offer: false,
    location: '',
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    location,
    offer,
    regularPrice,
    discountPrice,
    images,
    latitude,
    longitude,
  } = formData

  //initialize loading state
  const [loading, setLoading] = useState(true)
  const auth = getAuth()
  const isMounted = useRef(true)
  const navigate = useNavigate()
  //check for signed in user on mount

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        //if user is signed in
        if (user) {
          setFormData((prevState) => ({ ...prevState, userRef: user.uid }))
          setLoading(false)
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => (isMounted.current = false)
  }, [isMounted])

  if (loading) return <Spinner />

  const onSubmit = (e) => {
    e.preventDefault()
  }
  const onMutate = () => {}
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="" className="formlabel">
            Sell / Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              id="type"
              className={type == 'sale' ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}
              value="sale"
            >
              Sell
            </button>
            <button
              type="button"
              id="type"
              className={type == 'rent' ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}
              value="rent"
            >
              Rent
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
