/**
 * Seed Script for Initial Data
 * 
 * Run this script to populate Firestore with sample branches and reviews.
 * 
 * Usage:
 * 1. Install ts-node: npm install -g ts-node
 * 2. Set up Firebase Admin SDK credentials
 * 3. Run: npx ts-node scripts/seed-data.ts
 * 
 * OR use Firebase console to add data manually.
 */

// NOTE: This script requires firebase-admin package
// npm install firebase-admin --save-dev

/*
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Initialize with service account
const serviceAccount = require('./serviceAccountKey.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

async function seedBranches() {
  const branches = [
    {
      name: 'Downtown',
      location: '123 Main Street, City Center',
      address: '123 Main Street, Suite 100, New York, NY 10001',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Uptown',
      location: '456 Oak Avenue, Uptown District',
      address: '456 Oak Avenue, New York, NY 10025',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Mall Location',
      location: 'City Mall, Level 2',
      address: 'City Mall, 789 Shopping Way, Level 2, Store 205',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Airport Terminal',
      location: 'International Airport, Terminal B',
      address: 'International Airport, Terminal B, Gate 25',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Beach Resort',
      location: 'Oceanfront Hotel, Ground Floor',
      address: '100 Beachfront Drive, Miami, FL 33139',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ]

  console.log('Seeding branches...')
  
  for (const branch of branches) {
    const docRef = await db.collection('branches').add(branch)
    console.log(`Created branch: ${branch.name} (${docRef.id})`)
  }
  
  console.log('Branches seeded successfully!')
}

async function seedReviews() {
  // Get existing branches
  const branchesSnap = await db.collection('branches').get()
  const branchIds = branchesSnap.docs.map(doc => doc.id)
  
  if (branchIds.length === 0) {
    console.log('No branches found. Run seedBranches first.')
    return
  }

  const comments = [
    'Great food and excellent service!',
    'The ambiance was wonderful. Will definitely come back.',
    'Food was okay, but service could be better.',
    'Amazing experience! Highly recommend.',
    'Delicious meals and friendly staff.',
    'A bit crowded but worth the wait.',
    'Perfect for family dinners.',
    'The desserts are to die for!',
    null, // Some reviews have no comment
    null,
  ]

  const names = [
    'John Smith',
    'Sarah Johnson',
    'Mike Brown',
    'Emily Davis',
    'Alex Wilson',
    null, // Anonymous
    null,
    'Chris Lee',
    'Lisa Anderson',
    null,
  ]

  console.log('Seeding reviews...')
  
  const now = new Date()
  const reviews = []
  
  // Generate 50 sample reviews over the past 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const reviewDate = new Date(now)
    reviewDate.setDate(reviewDate.getDate() - daysAgo)
    reviewDate.setHours(
      Math.floor(Math.random() * 14) + 10, // 10 AM - midnight
      Math.floor(Math.random() * 60),
      0
    )
    
    const review = {
      branchId: branchIds[Math.floor(Math.random() * branchIds.length)],
      rating: Math.floor(Math.random() * 5) + 1, // 1-5
      comment: comments[Math.floor(Math.random() * comments.length)],
      customerName: names[Math.floor(Math.random() * names.length)],
      contact: Math.random() > 0.5 
        ? `customer${i}@email.com` 
        : Math.random() > 0.5 
          ? `+1555${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`
          : null,
      billId: Math.random() > 0.7 ? `BILL-${1000 + i}` : null,
      createdAt: Timestamp.fromDate(reviewDate),
    }
    
    reviews.push(review)
  }
  
  // Batch write reviews
  const batch = db.batch()
  reviews.forEach((review) => {
    const docRef = db.collection('reviews').doc()
    batch.set(docRef, review)
  })
  
  await batch.commit()
  console.log(`Seeded ${reviews.length} reviews successfully!`)
}

async function main() {
  try {
    await seedBranches()
    await seedReviews()
    console.log('\\n✅ Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

main()
*/

console.log(`
=================================================
SEED DATA INSTRUCTIONS
=================================================

To seed your Firestore database with sample data:

OPTION 1: Use Firebase Console (Recommended for Quick Start)
---------------------------------------------------------
1. Go to Firebase Console > Firestore Database
2. Create a 'branches' collection with documents like:
   
   {
     "name": "Downtown",
     "location": "123 Main Street, City Center",
     "isActive": true,
     "createdAt": <SERVER_TIMESTAMP>,
     "updatedAt": <SERVER_TIMESTAMP>
   }

3. Create a 'reviews' collection with documents like:
   
   {
     "branchId": "<BRANCH_DOCUMENT_ID>",
     "rating": 5,
     "comment": "Great food!",
     "customerName": "John Doe",
     "contact": "john@email.com",
     "billId": "BILL-1001",
     "createdAt": <SERVER_TIMESTAMP>
   }

OPTION 2: Use Firebase Admin SDK
---------------------------------
1. Download service account key from Firebase Console
2. Install firebase-admin: npm install firebase-admin
3. Uncomment the code above and run:
   npx ts-node scripts/seed-data.ts

=================================================
`)

