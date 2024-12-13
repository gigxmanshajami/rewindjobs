'use client';
import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from "../../firebase/firebase";
import { onAuthStateChanged } from 'firebase/auth'; // import onAuthStateChanged
import { LoaderCircle } from 'lucide-react';

const EmailVerified = () => {
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [uid, setUid] = useState<string | null>(null);  // To store UID

    useEffect(() => {
        // Using vanilla JavaScript to get query params
        const urlParams = new URLSearchParams(window.location.search);
        const uidParam = urlParams.get('uid'); // Get the 'uid' from the URL query string

        if (uidParam) {
            setUid(uidParam); // Set the UID from the URL
        }
    }, []); // Empty dependency array ensures this runs only once on component mount

    useEffect(() => {
        const verifyEmail = async (user) => {
            if (!user) {
                setError('No user found.');
                setLoading(false);
                return;
            }

            if (user.emailVerified === false) {
                try {
                    const userDocRef = doc(db, 'users', uid);
                    await setDoc(userDocRef, {
                        emailVerified: true,
                    }, { merge: true }); // Merge to avoid overwriting other data

                    // After the update, mark the operation as successful
                    setSuccess(true);
                } catch (error) {
                    setError('Error verifying email.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                alert('Email is already verified');
                window.location.href = '/profile';
            }
        };

        if (uid) {
            // Listen for auth state changes (check if the user is authenticated)
            onAuthStateChanged(auth, (user) => {
                if (user && user.uid === uid) {
                    // Only call verifyEmail if the user matches the UID
                    verifyEmail(user);
                }
            });
        }
    }, [uid]); // Dependency array with uid

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex items-center space-x-2">
                    <LoaderCircle size={24} className="animate-spin" />
                    <span className="text-lg text-gray-600">Verifying your email...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            {success && !loading && (
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-green-600">Email Verified Successfully!</h1>
                    <p className="mt-4 text-lg">Your email has been verified. You can now go to your profile.</p>
                    <button
                        onClick={() => window.location.href = '/profile'}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Go to Profile
                    </button>
                </div>
            )}

            {error && !loading && (
                <div className="text-center text-red-600">
                    <h1 className="text-2xl font-semibold">Error</h1>
                    <p className="mt-4">{error}</p>
                </div>
            )}
        </div>
    );
};

export default EmailVerified;
