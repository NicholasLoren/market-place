import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from './../components/ListingItem'

function Offers() {
  const params = useParams()
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)

  const [lastFetchedListing, setLastFetchedListing] = useState(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        //create lisings ref
        const listingsRef = collection(db, 'listing')
        //create a query
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
        //Excecute the query
        const listingsSnap = await getDocs(q)
        const lastVisible = listingsSnap.docs[listingsSnap.docs.length - 1]
        setLastFetchedListing(lastVisible)
        const listings = []

        listingsSnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })

        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }

    fetchListings()
  }, [])

  //Load more listings
  const fetchMoreUserListings = async () => {
    const listingsRef = collection(db, 'listing')
    const q = query(
      listingsRef,
      where('offer', '==', true),
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

  //Dsiplay the listings
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length <= 0 ? (
        <p>There are currently no offers</p>
      ) : (
        <main>
          <div className="categoryListings">
            {listings.map((listing) => (
              <ListingItem
                key={listing.id}
                listing={listing.data}
                id={listing.id}
              />
            ))}
          </div>

          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={fetchMoreUserListings}>
              Load More
            </p>
          )}
        </main>
      )}
    </div>
  )
}

export default Offers
