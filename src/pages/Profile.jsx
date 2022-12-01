import { useState, useEffect } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import {
  updateDoc,
  doc,
  collection,
  query,
  getDocs,
  orderBy,
  where,
  deleteDoc,
  startAfter,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import ArrowRightIcon from '../assets/svg/keyboardArrowRightIcon.svg'
import HomeIcon from '../assets/svg/homeIcon.svg'
import ListingItem from './../components/ListingItem'
const Profile = () => {
  const auth = getAuth()
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const [lastFetchedListing, setLastFetchedListing] = useState(null)
  const [changeDetails, setChangeDetails] = useState(false)
  const navigate = useNavigate()
  const { name, email } = formData
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listing')
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const querySnap = await getDocs(q)
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)
      let listings = []
      querySnap.forEach((doc) => {
        return listings.push({ id: doc.id, data: doc.data() })
      })
      setListings(listings)
      setLoading(false)
    }

    fetchUserListings()
  }, [auth.currentUser.uid])

  //Load more listings
  const fetchMoreUserListings = async () => {
    const listingsRef = collection(db, 'listing')
    const q = query(
      listingsRef,
      where('userRef', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      startAfter(lastFetchedListing),
      limit(10)
    )
    const querySnap = await getDocs(q)
    const lastVisible = querySnap.docs[querySnap.docs.length - 1]
    setLastFetchedListing(lastVisible)
    const listings = []

    querySnap.forEach((doc) => {
      return listings.push({ id: doc.id, data: doc.data() })
    })
    setListings((prevState) => [...prevState, ...listings])
    setLoading(false)
  }
  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteDoc(doc(db, 'listing', listingId))

      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      )
      setListings(updatedListings)
      toast.success('Listing removed from list')
    }
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

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

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>

            <br />
            <br />
            {lastFetchedListing && (
              <p className="loadMore" onClick={fetchMoreUserListings}>
                Load More
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
