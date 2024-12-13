// import { db } from '../../lib/firebase-admin';

// export default async function handler(req, res) {
//   // Validate HTTP method
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   // Extract the email details from the request body
//   const { to, subject, html } = req.body;

//   // Validate input
//   if (!to || !subject || !html) {
//     return res.status(400).json({
//       error: 'Missing required fields: to, subject, html',
//     });
//   }

//   try {
//     // Add email data to the Firestore `mail` collection
//     await db.collection('mail').add({
//       to,
//       message: {
//         subject,
//         html,
//       },
//     });

//     // Respond with success
//     return res.status(200).json({
//       message: 'Email added to the queue successfully.',
//     });
//   } catch (error) {
//     console.error('Error adding email to Firestore:', error);

//     // Respond with error
//     return res.status(500).json({
//       error: 'Failed to queue email.',
//     });
//   }
// }