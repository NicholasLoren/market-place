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

function Category() {
  const params = useParams()
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        //create lisings ref
        const listingsRef = collection(db, 'listing')
        //create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
        //Excecute the query
        const listingsSnap = await getDocs(q)
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
  }, [params.categoryName])

  //Dsiplay the listings
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Listings for {params.categoryName}</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length <= 0 ? (
        <p>No listings found</p>
      ) : (
        <main>
          <div className="categoryListings">
            {listings.map((listing) => (
              <h3 key={listing.id}>{listing.data.name}</h3>
            ))}
          </div>
        </main>
      )}
    </div>
  )
}

export default Category
