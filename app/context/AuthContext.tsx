// 'use client';
// import { useContext, createContext, useState, useEffect } from "react";
// import {
//   signInWithPopup,
//   signOut,
//   onAuthStateChanged,
//   GoogleAuthProvider,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
// } from "firebase/auth";
// import { auth } from "../firebase/firebase"; // Ensure you have initialized Firebase Auth here
// import { db } from "../firebase/firebase"; // Firestore instance
// import { doc, setDoc,getDoc, collection } from "firebase/firestore";

// const AuthContext = createContext();

// export const AuthContextProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState('');

//   const googleSignIn = async () => {
//     const provider = new GoogleAuthProvider();
//     try {
//       const credential = await signInWithPopup(auth, provider);
//       const uid = credential.user.uid;

//       // Check if user already exists in Firestore
//       const userDocRef = doc(db, "users", uid);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         alert('User already exists. Please log in.');
//         return; // Exit if the user already exists
//       }

//       // Save user data to Firestore
//       await setDoc(userDocRef, {
//         name: credential.user.displayName,
//         email: credential.user.email,
//         mobile: credential.user.phoneNumber,
//         image: credential.user.photoURL,
//         emailVerified: credential.user.emailVerified,
//         uid: credential.user.uid,
//         signType: 'google',
//       });
//       console.log('User data saved to Firestore');
//       alert('User data saved to Firestore');
//     } catch (error) {
//       console.error('Error during Google sign in:', error);
//       alert('Failed to sign in with Google. Please try again.');
//     }
//   };

//   // In your sign-in form's handleSubmit function
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { email, password } = formData;

//     try {
//       // Check if user exists in Firebase Auth
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       console.log('User signed in successfully');

//       // Check if user exists in Firestore
//       const uid = userCredential.user.uid;
//       const userDocRef = doc(db, "users", uid);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         alert('User does not exist in Firestore. Please check your account.');
//         return; // Exit if the user does not exist
//       }

//       alert('User signed in successfully');
//       // Add further actions here, like navigation
//     } catch (error) {
//       console.error("Error signing in:", error);
//       alert('Error signing in, please check your credentials.');
//     }
//   };


//   const logOut = () => {
//     signOut(auth);
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const sendOtp = async (phoneNumber) => {
//     // Check if recaptcha-container is available
//     const recaptchaContainer = document.getElementById('recaptcha-container');
//     if (!recaptchaContainer) {
//       console.error('Recaptcha container not found!');
//       return;
//     }

//     // Create a new RecaptchaVerifier
//     const appVerifier = new RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible',
//       callback: (response) => {
//         // reCAPTCHA solved
//       },
//       'expired-callback': () => {
//         // Handle expiration
//       }
//     }, auth);

//     // Send OTP
//     try {
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       window.confirmationResult = confirmationResult; // Store confirmation result for later use
//       alert('OTP sent to your phone number.');
//     } catch (error) {
//       console.error('Error during sending OTP:', error);
//       alert('Failed to send OTP. Please try again.');
//     }
//   };

//   const verifyOtp = async (otp) => {
//     try {
//       const result = await window.confirmationResult.confirm(otp);
//       const user = result.user;

//       // Store the phone number in Firestore
//       await addPhoneNumberToFirestore(user.uid, user.phoneNumber);
//       alert('OTP verified successfully!');
//     } catch (error) {
//       console.error('Error verifying OTP:', error);
//       alert('Invalid OTP. Please try again.');
//     }
//   };

//   const addPhoneNumberToFirestore = async (uid, phoneNumber) => {
//     try {
//       const docRef = doc(collection(db, "users"), uid);
//       await setDoc(docRef, {
//         phoneNumber: phoneNumber,
//       }, { merge: true });
//       console.log('Phone number added to Firestore successfully!');
//     } catch (error) {
//       console.error('Error adding phone number to Firestore:', error);
//     }
//   };

//   const handlePhoneSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Phone number submitted:", phoneNumber);
//     await sendOtp(`+91${phoneNumber}`); // Ensure the phone number is formatted with country code
//     setShowPopup(false); // Close the popup after submission
//   };

//   return (
//     <AuthContext.Provider value={{ user, googleSignIn, logOut, verifyOtp }}>
//       {children}

//       {/* Phone Number Popup */}
//       {showPopup && (
//         <div
//           className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300`}
//           onClick={() => setShowPopup(false)} // Clicking outside the popup closes it
//         >
//           <div
//             className={`bg-white p-8 rounded-lg shadow-lg max-w-md w-full`}
//             onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
//           >
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">Enter your mobile number</h2>

//             {/* Form for phone number */}
//             <form onSubmit={handlePhoneSubmit} className="space-y-4">
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-600">
//                   Mobile Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   required
//                   className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//               <div className="flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
//                   onClick={() => setShowPopup(false)} // Cancel button to close popup
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 >
//                   Send OTP
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* reCAPTCHA Container */}
//       <div id="recaptcha-container" style={{ display: 'none' }}></div>
//     </AuthContext.Provider>
//   );
// };

// export const UserAuth = () => {
//   return useContext(AuthContext);
// };
