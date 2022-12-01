import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { db } from '../firebase.config'
import { serverTimestamp, updateDoc, getDoc, doc } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import { toast } from 'react-toastify'
function EditListing() {
  //Initialize our state for the form
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(false)
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
    address: '',
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountPrice,
    images,
    latitude,
    longitude,
  } = formData

  //initialize loading state
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState()
  const params = useParams()
  const auth = getAuth()
  const isMounted = useRef(true)
  const navigate = useNavigate()

  //redirect if listing is not for users

  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit this listing')
      navigate('/')
    }
  }, [auth.currentUser.uid, listing, navigate])

  //fetches listing to edit
  useEffect(() => {
    setLoading(true)

    const fetchListing = async () => {
      const docRef = doc(db, 'listing', params.listingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setListing(docSnap.data())
        setFormData({ ...docSnap.data(), address: docSnap.data().location })
        setLoading(false)
      } else {
        navigate('/')
        toast.error('Could not find listing')
      }
    }

    fetchListing()
  }, [params.listingId, navigate])

  //check for signed in user on mount and sets user ref to logged in user
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
  }, [isMounted, auth, navigate])

  if (loading) return <Spinner />

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (discountPrice > regularPrice) {
      setLoading(false)
      toast.error('Discount price cannot be greater than regular price')
      return
    }
    //Handling no Geocode api
    let geolocation = {}
    let location
    if (geolocationEnabled) {
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
      location = address
    }

    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${image.name}`
        const storageRef = ref(storage, 'images/' + fileName)
        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                console.log('Something went rong')
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    //Upload the images
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false)
      console.log(error)
      toast.error('Could not upload images')
      return
    })

    const formDataCopy = {
      ...formData,
      geolocation,
      imgUrls,
      timestamp: serverTimestamp(),
    }

    delete formDataCopy.images
    delete formDataCopy.address
    location && (formDataCopy.location = location)

    !formDataCopy.offer && delete formDataCopy.discountPrice
    const docRef = doc(db, 'listing', params.listingId)
    await updateDoc(docRef, formDataCopy)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    setLoading(false)
  }
  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') boolean = true
    if (e.target.value === 'false') boolean = false

    if (e.target.files) {
      setFormData((prevState) => ({ ...prevState, images: e.target.files }))
    }
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a listing</p>
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
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}
              value="sale"
            >
              Sell
            </button>
            <button
              type="button"
              id="type"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              onClick={onMutate}
              value="rent"
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountPrice"
                value={discountPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing
