
// @ts-nocheck 
"use client";
import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { auth, db, storage, } from "../firebase/firebase";
import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress"

import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { onAuthStateChanged, getAuth, PhoneAuthProvider, signInWithCredential, RecaptchaVerifier, linkWithCredential, reauthenticateWithCredential, updateProfile, sendEmailVerification } from "firebase/auth";
import { Textarea } from "@/components/ui/textarea"
import { LoaderCircle, Router, BadgeCheck, CircleAlert } from 'lucide-react';
import { ref, deleteObject, listAll, uploadBytes, getDownloadURL, uploadBytesResumable, } from "firebase/storage";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { debounce, } from 'lodash';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import _isEqual from 'lodash/isEqual'
import Link from 'next/link';
import { FaCamera } from "react-icons/fa";
import { MapPinHouse, Pencil, BriefcaseBusiness, Calendar, Phone, Mail, CloudDownload, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import { Badge } from "@/components/ui/badge";
// import { useSectionRefs } from "../SectionRefsContext
import { format } from 'date-fns';
import { Console } from "console";
type Props = {}
const sections = ["uploadSection", "statusSection"];
const missingFieldLabels = {
    name: "Name",
    email: "Email",
    profileSummary: "Profile Summary",
    location: "Preferred Location",
    mobile: "Mobile Number",
    photoURL: "Profile Photo",
    "resume.resumepath": "Resume",
    "skills.keys": "Skills",
};

const Page = (props: Props) => {

    const [otp, setOtp] = useState("");  // OTP state
    const [verificationId, setVerificationId] = useState("");  // Store Firebase OTP verification ID
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false); // Control dialog visibility
    const [countdown, setCountdown] = useState(40); // Countdown state for resend OTP
    const [tempNumber, setTempNumber] = useState(null);
    const [isResendDisabled, setIsResendDisabled] = useState(false); // Disable resend after 40 seconds
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpLoadingtwo, setOtpLoadingtwo] = useState(false);
    const [comploading, setcomploading] = useState(false);
    const [openDialog, setOpenDialog] = useState(null);
    const [prevFormData, setPrevFormData] = useState({});
    const [unfilledFields, setUnfilledFields] = useState([]);
    const [verifiedMobile, setVerifiedMobile] = useState("");
    const [mobileVerified, setMobileVerified] = useState(false);
    const [open, setOpen] = useState(false);
    const [openResumeHeadlineDialog, setOpenResumeHeadlineDialog] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [geoLoading, setgeoLoading] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [selectedJobType, setSelectedJobType] = useState("");
    const [mensen, setMensen] = useState([]);
    const [location, setLocation] = useState();
    const router = useRouter();
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/signin')
                console.log('user not logged in')
            }
        })
    }, [])
    const fetchApiData = async (latitude, longitude, config) => {
        try {
            setgeoLoading(true);

            console.log(latitude, longitude, "from fetch app")
            const res = await fetch(`https://api-bdc.io/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            setMensen(data);
            console.log(data, latitude, longitude);

            // Update the present location in formData
            if (data.locality || data.city || data.principalSubdivision) {
                const location = `${data.locality || data.city}, ${data.principalSubdivision || ''}`;
                if (config == 'present') {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        presentLocation: location,
                    }));
                } else if (config == 'current') {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        location: location,
                    }));
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Location Error",
                    description: "Unable to fetch a valid location.",
                });
            }
            setgeoLoading(false);
        } catch (error) {
            setgeoLoading(false);
            console.error("Error fetching location data:", error);
            toast({
                variant: "destructive",
                title: "API Error",
                description: "Failed to fetch location data. Please try again.",
            });
        }
    };

    const fetchGeo = async (config) => {
        setgeoLoading(true);
        if ('geolocation' in navigator && 'permissions' in navigator) {
            try {
                // Check geolocation permission status
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

                if (permissionStatus.state === 'granted') {
                    // If permission is granted, get the user's location
                    navigator.geolocation.getCurrentPosition(
                        ({ coords }) => {
                            const { latitude, longitude } = coords;
                            fetchApiData(latitude, longitude, config);
                            console.log(latitude, longitude, 'Location fetched');
                        },
                        (error) => {
                            console.error('Error fetching location:', error);
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: 'Failed to retrieve your location.',
                            });
                        }
                    );
                } else if (permissionStatus.state === 'prompt') {
                    // Prompt the user for permission
                    navigator.geolocation.getCurrentPosition(
                        ({ coords }) => {
                            const { latitude, longitude } = coords;
                            fetchApiData(latitude, longitude);
                            console.log(latitude, longitude, 'Location fetched');
                        },
                        (error) => {
                            console.error('Error fetching location:', error);
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: 'Failed to retrieve your location.',
                            });
                        }
                    );
                    setgeoLoading(false);

                } else {
                    // If permission is denied
                    toast({
                        variant: "destructive",
                        title: "Permission Denied",
                        description: 'Location access is denied. Please enable it in your browser settings.',
                    });
                }
            } catch (error) {
                console.error('Permission check failed:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: 'Unable to check location permissions.',
                });
            } finally {
                setgeoLoading(false);
            }
        } else {
            setgeoLoading(false);

            // If geolocation is not available
            toast({
                variant: "destructive",
                title: "Not Supported",
                description: 'Geolocation is not supported by your browser.',
            });
        }
    };


    // useEffect(() => {
    //     // Fetch data from API if `location` object is set
    //     if (location) {
    //         fetchApiData(location);
    //     }
    // }, [location]);
    const handleSelectChange = (value) => {
        setSelectedJobType(value);
    };

    const [zoom, setZoom] = useState(1);
    const [originalFileName, setOriginalFileName] = useState({ name: '', type: '' }); // Store original file name
    const fileInputRef = useRef(null);
    const [cropping, setCropping] = useState(false);
    const [progress, setProgress] = useState(0)
    const [cropArea, setCropArea] = useState(null);

    // const sectionRefs = useRef({}); // Store refs for each missing field
    const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState("");
    const [employmentDetails, setEmploymentDetails] = useState({});


    // Utility function to update state only if values have changed
    const updateStateIfChanged = (prevState, newState, setState) => {
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
            setState(newState);
        }
    };

    // Populate refs for each field
    // const populateRefs = (fields) => {
    //     fields.forEach((field) => {
    //         if (!sectionRefs.current[field]) {
    //             sectionRefs.current[field] = React.createRef();
    //         }
    //     });
    // };

    useEffect(() => {
        if (open == false) {
            setFormData(prevFormData);
        }
    }, [open]);



    const fetchUserData = async (user) => {
        if (!user) {
            console.warn("No user provided for fetching data.");
            return null;
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();

                // 1. Set Dialog Data if necessary
                const updatedDialogData = {
                    skills: data?.skills?.keys || [],
                    summary: data?.profileSummary || "",
                    resumeheadline: data?.resume?.resumeheadline || "",
                };

                setDialogData((prev) => {
                    if (
                        prev.skills !== updatedDialogData.skills ||
                        prev.summary !== updatedDialogData.summary ||
                        prev.resumeheadline !== updatedDialogData.resumeheadline
                    ) {
                        return updatedDialogData;
                    }
                    return prev; // Only update if fields have changed
                });

                // 2. Set Form Data if necessary
                setPrevFormData((prev) => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) {
                        return data; // Only update if form data has changed
                    }
                    return prev; // Skip update if data hasn't changed
                });

                // 3. Update other states like mobileVerified and verifiedMobile
                setMobileVerified(data.mobileVerified);
                setVerifiedMobile(data.mobile);

                console.log(data);
                return data;
            } else {
                console.warn("No data found for the user.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred while fetching your profile data. Please try again.",
            });
            return null;
        }
    };



    const calculateProgress = useCallback((userData, missingFieldMessages = {}) => {
        // Define the fields you want to track
        const fields = [
            "name",
            "email",
            "profileSummary",
            "location",
            "mobile",
            "photoURL",
            "resume.resumeheadline",
            "resume.resumepath", // Nested field
            "availability",
            "employmentStatus",
            "layoffDate",
            "expectedLocation",
            "gender",
            "jobType",
            "presentLocation",
        ];

        // Arrays to track missing and filled fields
        const missingFields = [];
        const filledFields = [];

        // Loop over fields and check their values in userData
        fields.forEach((field) => {
            const keys = field.split(".");
            let value = userData;

            // Traverse nested fields
            keys.forEach((key) => {
                value = value?.[key];
            });

            // Check if field value is missing
            if (!value) {
                missingFields.push(field); // Push missing fields
            } else {
                filledFields.push(field); // Push filled fields
            }
        });

        // Check for mobileVerified and emailVerified separately
        if (!userData?.mobileVerified) {
            missingFields.push("mobileVerified");
        } else {
            filledFields.push("mobileVerified");
        }

        if (!userData?.emailVerified) {
            missingFields.push("emailVerified");
        } else {
            filledFields.push("emailVerified");
        }

        // Check for skills.keys and handle custom missing message if it's empty
        const skillsKeys = userData?.skills?.keys;
        if (Array.isArray(skillsKeys) && skillsKeys.length > 0) {
            filledFields.push("skills.keys");
        } else {
            missingFields.push("skills.keys");
        }

        // Map the missing fields to custom messages, using the missingFieldMessages object
        const customMissingMessages = missingFields.map((field) => {
            return missingFieldMessages[field] || `Missing field: ${field}`; // Use custom message or default
        });

        // Calculate progress based on filled and total fields
        const totalFields = fields.length + 1 + 2; // +1 for skills.keys, +2 for mobileVerified and emailVerified
        const progressValue = Math.round((filledFields.length / totalFields) * 100);

        // Update progress and missing fields with custom messages
        setProgress(progressValue);
        setUnfilledFields(customMissingMessages); // Set custom messages for missing fields

        // Return the progress and missing fields
        return { progress: progressValue, missingFields };
    }, []);




    // Debounced version for side effects
    const debouncedUpdateUserProgress = useCallback(
        debounce(async (userId, userData) => {
            try {
                const missingFieldMessages = {
                    "mobileVerified": "Mobile is not verified. Please verify your mobile number.",
                    "emailVerified": "Email is not verified. Please verify your email.",
                    "skills.keys": "You need to add some skills.",
                    "profileSummary": "Profile summary is missing. Please fill it in.",
                    "resume.resumepath": "Resume file is missing, please upload it.",
                    "gender": "Gender is missing. Please select your gender.",
                    "name": "Name is required. Please provide your name.",
                    "email": "Email is required. Please provide a valid email address.",
                    "mobile": "Mobile number is required. Please provide your mobile number.",
                    "photoURL": "Profile photo is missing. Please upload your photo.",
                    "availability": "Availability date is missing. Please specify your availability.",
                    "employmentStatus": "Employment status is missing. Please provide your status.",
                    "layoffDate": "Layoff date is missing. Please provide the date of layoff.",
                    "expectedLocation": "Expected location is missing. Please specify your preferred location.",
                    "location": "Location is missing. Please provide your current location.",
                    "jobType": "Job type is missing. Please specify your preferred job type.",
                    "presentLocation": "Current location is missing. Please provide your present location.",
                    "resume.resumeheadline": "Resume headline is missing. Please add a headline to your resume.",
                };

                const { progress } = calculateProgress(userData, missingFieldMessages); // Call the sync version
                console.log(progress);
                // Update progress in Firestore
                const userDoc = doc(db, "users", userId);
                await updateDoc(userDoc, { progress });
                console.log(`User progress updated to ${progress}%`);
            } catch (error) {
                console.error("Error updating progress:", error);
            }
        }, 500), // Debounce for 500ms
        [calculateProgress]
    );

    const updateUserProgress = async (userId, userData) => {
        // Call the debounced version for async updates
        debouncedUpdateUserProgress(userId, userData);
    };

    // const calculateProgress = useCallback(debounce((userData) => {
    //     const fields = [
    //         "name",
    //         "email",
    //         "profileSummary",
    //         "location",
    //         "mobile",
    //         "photoURL",
    //         "resume.resumeheadline",
    //         "resume.resumepath", // Nested field
    //     ];

    //     const missingFields = [];
    //     const filledFields = fields.filter((field) => {
    //         const keys = field.split(".");
    //         let value = userData;

    //         keys.forEach((key) => {
    //             value = value?.[key];
    //         });

    //         if (!value) {
    //             missingFields.push(field);
    //         }

    //         return !!value;
    //     });

    //     const skillsKeys = userData?.skills?.keys;
    //     if (Array.isArray(skillsKeys) && skillsKeys.length > 0) {
    //         filledFields.push("skills.keys");
    //     } else {
    //         missingFields.push("skills.keys");
    //     }

    //     const totalFields = fields.length + 1; // +1 for skills.keys field
    //     const progressValue = Math.round((filledFields.length / totalFields) * 100);

    //     setProgress(progressValue);

    //     setUnfilledFields(missingFields.map((field) => missingFieldLabels[field] || field));

    //     populateRefs(missingFields);

    //     console.log(progressValue)
    //     return { progress: progressValue, missingFields };
    // }, 500), []); // Debounce for 500ms

    // const updateUserProgress = async (userId, userData) => {
    //     try {
    //         const { progress } = calculateProgress(userData);
    //         console.log(progress)
    //         // Update progress in Firestore
    //         const userDoc = doc(db, "users", userId);
    //         await updateDoc(userDoc, { progress });
    //         console.log(`User progress updated to ${progress}%`);
    //     } catch (error) {
    //         console.error("Error updating progress:", error);
    //     }
    // };


    const subscribeToUser = (userId) => {
        const userDoc = doc(db, "users", userId);

        return onSnapshot(userDoc, (snapshot) => {
            const userData = snapshot.data();
            if (userData) {
                updateUserProgress(userId, userData);
            }
        });
    };

    useEffect(() => {
        const initialize = async () => {
            setcomploading(true);

            try {
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        const userData = await fetchUserData(user);

                        // Subscribe to Firestore changes
                        const firestoreUnsubscribe = subscribeToUser(user.uid);

                        // Calculate progress initially
                        calculateProgress(userData);

                        // Cleanup function to unsubscribe from Firestore
                        return () => firestoreUnsubscribe();
                    } else {
                        console.warn("No user is signed in.");
                    }
                });

                // Cleanup function to unsubscribe from auth state listener
                return () => unsubscribe();
            } catch (error) {
                console.error("Error initializing user data:", error);
            } finally {
                setcomploading(false);
            }
        };

        initialize();
    }, []); // Empty dependency array ensures this runs once on mount

    // const handleScrollToFirstMissingField = () => {
    //     // Find the first missing field using unfilledFields
    //     const firstMissingFieldKey = unfilledFields[0];

    //     if (firstMissingFieldKey) {
    //         const firstMissingFieldRef = sectionRefs.current[firstMissingFieldKey];

    //         if (firstMissingFieldRef && firstMissingFieldRef.current) {
    //             firstMissingFieldRef.current.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center", // Scroll to the center of the screen
    //             });
    //         }
    //     }
    // };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };
    const base64ToBlob = (base64, mimeType) => {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeType });
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setCropping(true);
            };
            setOriginalFileName({ name: file.name, type: file.type });
            reader.readAsDataURL(file);

        }
    };
    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        // Store the crop area for later confirmation
        setCropArea(croppedAreaPixels);
    };

    const handleConfirmCrop = async () => {
        if (cropArea) {
            const croppedBase64Image = await getCroppedImg(selectedImage, cropArea);
            setCroppedImage(croppedBase64Image);
            await uploadCroppedImage(croppedBase64Image, originalFileName);
        }
        setCropping(false);
    };

    const uploadCroppedImage = async (croppedImageBase64, originalFileName) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("No authenticated user found.");
            return;
        }

        try {
            const blob = base64ToBlob(croppedImageBase64, originalFileName.type);
            const storagePath = `usersProfile/${user.uid}`; // Define storage path for the user
            const storageRef = ref(storage, storagePath); // Reference to the user's folder

            // List all files in the user's folder
            const listResult = await listAll(storageRef);

            // Delete all previous images
            for (const item of listResult.items) {
                await deleteObject(item);
                console.log(`Deleted: ${item.fullPath}`);
            }

            // Set up reference and metadata for new image upload
            const newImageRef = ref(storage, `${storagePath}/${originalFileName.name}`);
            const metadata = {
                contentType: originalFileName.type, // Set MIME type correctly
            };

            const uploadTask = uploadBytesResumable(newImageRef, blob, metadata);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (err) => {
                    console.error("Upload error:", err);
                },
                async () => {
                    console.log("Upload complete");
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File available at", downloadURL);

                    // Update Firestore user profile URL
                    await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL, lastUpdated: new Date() });
                    // updating the auth data
                    updateProfile(auth.currentUser, {
                        photoURL: downloadURL,
                    }).then(() => console.log('changed')).catch(err => {
                        throw new Error('Something went wrong while upadting the auth', err);
                    });
                    // Show a toast message and reload the page
                    toast({ title: "Image uploaded successfully" });
                    window.location.reload();
                }
            );
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error.message || "Failed to upload cropped image to Firebase",
            });
        }
    };
    useEffect(() => {
        console.log(userDetail);

    }, [])
    const handleCancelCrop = () => {
        setSelectedImage(null); // Clear selected image
        setCropping(false); // Close cropping dialog
    };

    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        mobile: "",
        email: '',
        gender: '',
        presentLocation: '',
        expectedLocation: '',
        employmentStatus: '',
        lastUpdated: '',
        availability: '',
        jobType: '',
    });

    useEffect(() => {
        console.log(formData);
    }, [formData])
    const [dialogdata, setDialogData] = useState({});

    const handleAvailabilityChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            availability: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                console.log(formData.availability)
                const updateData = {
                    name: formData.name,
                    location: formData.location,
                    mobile: formData.mobile,
                    email: formData.email,
                    gender: formData.gender,
                    presentLocation: formData.presentLocation,
                    expectedLocation: formData.expectedLocation,
                    employmentStatus: formData.employmentStatus,
                    lastUpdated: new Date(),
                    jobType: formData.jobType,
                    availability: formData.availability,
                };

                // Add `noticePeriod` only if the status is "Notice Period"
                if (formData.employmentStatus === "notice-period") {
                    updateData.noticePeriod = formData.noticePeriod;
                }

                // Add `layoffDate` only if the status is "Layoff"
                if (formData.employmentStatus === "layoff") {
                    updateData.layoffDate = formData.layoffDate;
                }

                // Save the constructed data to Firestore
                await setDoc(userDocRef, updateData, { merge: true });
                toast({ title: "Profile updated successfully!" });
                setOpen(false);
                window.location.reload()
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Update failed",
                description: error.message || "Failed to update profile information",
            });
        }
    };

    const sendSMS = async (number) => {
        console.log(number);
        setOtpLoadingtwo(true);
        // setOtpLoading(true);
        try {
            const phoneNumber = number;
            // Send the phone number to your backend API route to trigger OTP sending
            const response = await fetch("/api/send-sms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber }),
            });

            if (!response.ok) {
                setOtpLoading(false);
                throw new Error('Failed to send OTP');
            } else {
                setOtpLoading(false);
            }

            const data = await response.json();

            setVerificationId(data.verificationId);
            setTempNumber(number);
            // Save the verification ID from Twilio
            setIsOtpDialogOpen(true);  // Automatically open the OTP dialog
            setOpen(false)
            // Start countdown for 40 seconds
            setIsResendDisabled(true);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false); // Enable Resend OTP after 40 seconds
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error("Error sending OTP:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred while sending the otp",
            });
            setOtpLoadingtwo(false);
            // setOtpLoading(false);
        } finally {
            setOtpLoadingtwo(false);
        }
    };


    useEffect(() => {
        let unsubscribeFirestore = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);

                // Cleanup any previous Firestore listener before attaching a new one
                if (unsubscribeFirestore) {
                    unsubscribeFirestore();
                }

                // Attach Firestore listener
                unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();

                        // Prevent unnecessary updates to `userDetail`
                        setUserDetail((prev) =>
                            _isEqual(prev, userData) ? prev : userData
                        );

                        // Handle last updated display
                        const lastUpdated = userData?.lastUpdated?.seconds
                            ? new Date(userData.lastUpdated.seconds * 1000)
                            : null;

                        if (lastUpdated) {
                            const today = new Date();
                            const isToday =
                                lastUpdated.getDate() === today.getDate() &&
                                lastUpdated.getMonth() === today.getMonth() &&
                                lastUpdated.getFullYear() === today.getFullYear();

                            setLastUpdatedDisplay((prev) => {
                                const newDisplay = isToday
                                    ? "Today"
                                    : lastUpdated.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    });

                                return prev === newDisplay ? prev : newDisplay;
                            });
                        }

                        // Prevent unnecessary updates to `formData`
                        // const newFormData = {
                        //     name: userData.name || "",
                        //     location: userData.location || "",
                        //     mobile: userData.mobile || "",
                        //     email: userData.email || "",
                        //     availability: userData.availability || "1 Month",
                        // };
                        // setFormData((prev) =>
                        //     _isEqual(prev, newFormData) ? prev : newFormData
                        // );
                        setFormData(userData)
                        console.log(userData)
                    } else {
                        // Clear user details if document doesn't exist
                        setUserDetail(null);
                    }
                });
            } else {
                // User is logged out; cleanup Firestore listener
                if (unsubscribeFirestore) {
                    unsubscribeFirestore();
                    unsubscribeFirestore = null;
                }
                setUserDetail(null);
            }
        });

        // Cleanup all listeners on component unmount
        return () => {
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
            }
            unsubscribeAuth();
        };
    }, []);


    const handleDialogOpen = (id) => {
        setOpenDialog(id);
    };
    const handleDialogDataChange = (e, fieldId) => {
        setDialogData((prevData) => ({
            ...prevData,
            [fieldId]: e.target.value, // Update the specific field dynamically
        }));
    };

    const handleDialogClose = () => {
        setOpenDialog(null);
        setFormData({});
    };
    const handleInputChange = (e, fieldId) => {
        console.log(fieldId, e.target.value);
        setFormData((prevData) => ({
            ...prevData,
            [fieldId]: e.target.value,
        }));
    };
    const saveHeadline = async (data) => {
        console.log(data);
        try {
            await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                "resume.resumeheadline": data.headline,
                lastUpdated: new Date(),
            });
            toast({ title: "Updated!" });
        } catch (err) {
            toast({ variant: "destructive", title: "Data Upload failed", description: err });
            throw new Error(`something went wrong ${err}`);
        }
    }
    const saveProfileSummary = async () => {
        console.log(dialogdata);
        try {
            await setDoc(doc(db, "users", auth.currentUser?.uid), {
                profileSummary: dialogdata.summary,
                lastUpdated: new Date(),
            }, { merge: true });
            toast({ title: "Summary added!" });
        } catch (err) {
            toast({ variant: "destructive", title: "Data Upload failed", description: err });
            throw new Error(`something went wrong ${err}`);
        }
    }

    const saveKeySkills = async () => {
        console.log(dialogdata);
        try {
            const userDoc = await getDoc(doc(db, "users", auth?.currentUser.uid));
            const data = userDoc.data();

            await setDoc(
                doc(db, "users", auth.currentUser?.uid),
                {
                    lastUpdated: new Date(),
                    skills: {
                        keys: dialogdata.skills
                    }

                },
                { merge: true } // Merge instead of overwriting
            );
            console.log('data exists true in keys')
            toast({ title: "Skills Added" });
        } catch (err) {
            toast({ variant: "destructive", title: "Data Upload failed", description: err });
            throw new Error(`something went wrong ${err}`);
        }
    }
    const links = [
        {
            id: 'resumeHeadline',
            link: 'Add resume headline',
            description: 'Add a summary of your resume to introduce yourself to recruiters',
            headline: 'Resume Headline',
            fields: [
                { id: 'headline', label: 'Headline', placeholder: `${dialogdata.resumeheadline || 'Enter your resume headline'}`, maxLength: 100 }
            ],
            save: (data) => saveHeadline(data),
        },
        {
            id: 'keySkills',
            link: 'Add key skills',
            description: 'Recruiters look for candidates with specific key skills',
            headline: 'Key Skills',
            fields: [], // No single input field; handled dynamically
            save: saveKeySkills,
        },
        // {
        //     id: 'employment',
        //     link: 'Add employment',
        //     description: 'Your employment details will help recruiters understand your experience',
        //     headline: 'Employment',
        //     fields: [],
        //     // save: saveEmployment,
        // },
        {
            id: 'profileSummary',
            link: 'Add profile summary',
            description: 'Highlight your key career achievements to help employers know your potential',
            headline: 'Profile Summary',
            fields: [
                { id: 'summary', label: 'Profile Summary', placeholder: `${dialogdata.summary || 'Summarize your career achievements'}`, maxLength: 300 }
            ],
            save: saveProfileSummary,
        }
    ];
    const handleSaveEmployment = () => {
        const employment = dialogdata.employment;

        // Basic validation can also be done here if desired
        if (
            !employment.company ||
            !employment.jobTitle ||
            !employment.joiningYear ||
            !employment.joiningMonth
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        // Example: Displaying the saved data
        console.log("Saved Employment Details:", employment);

        // Close the dialog after saving
        setOpenDialog("");
    };
    const handleOTPSubmit = async () => {
        try {
            setOtpLoading(true);
            const verificationResponse = await fetch("/api/verify-sms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: otp, phoneNumber: '+91' + formData.mobile, }),
            });

            if (!verificationResponse.ok) {
                throw new Error("Failed to verify OTP");
            }

            const data = await verificationResponse.json();

            if (data.status === "approved") {
                // setOtpLoading(false);
                toast({
                    title: "Verified",
                    description: "Phone Number Verified successfully",
                });
                // Proceed with registration (or login) after OTP verification
                await setDoc(doc(db, "users", auth.currentUser?.uid), {
                    mobile: formData.mobile,
                    mobileVerified: true,
                }, { merge: true });
                toast({
                    title: "Verified",
                    description: "User Verified Successfully....",
                });
                setOtpLoading(false);
                setIsOtpDialogOpen(false)
                window.location.reload();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "An error occurred while verifying the otp",
                });
                window.location.reload();
                setOtpLoading(false);
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            // setOtpLoading(false);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred while verifying the otp",
            });
            setOtpLoading(false);

        } finally {
            setOtpLoading(false);
        }
    };

    const sendVerificationEmail = async () => {
        toast({ title: "Queue", description: "Email is  in Queue" });


        // Set up the auth state observer
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, proceed with sending verification email
                const currentDomain = window.location.origin; // Get the current domain
                const customUrl = `${currentDomain}/profile/emailVerified?uid=${user.uid}`;

                const actionCodeSettings = {
                    url: customUrl, // Set the custom URL for the email verification link
                    handleCodeInApp: true,
                };

                try {
                    // Send verification email
                    await sendEmailVerification(user, actionCodeSettings);
                    console.log('Verification email sent!');
                    toast({ title: "Sent", description: "Verification Email Sent" });

                } catch (error) {
                    console.error('Error sending verification email:', error);
                    toast({ variant: 'destructive', title: "Failed", description: "An error occured while sending the verification email" });

                }
            } else {
                // No user is signed in
                console.log('No user is signed in.');
            }
        });
    };
    return (

        <div className="bg-[#f8f9fa] py-[15rem] flex flex-col justify-center gap-[0.9rem] px-4 pt-[2rem]" >
            <div id="recaptcha-container"></div>
            <Dialog open={cropping} onOpenChange={setCropping}>
                <DialogTrigger asChild>
                    <Button className="hidden">Open</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crop Your Image</DialogTitle>
                        <DialogDescription>
                            Adjust the crop area to select the part of the image you want to keep.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="crop-container" style={{ position: 'relative', width: '300px', height: '300px' }}>
                        {selectedImage && (
                            <Cropper
                                image={selectedImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // 1:1 aspect ratio for circular cropping
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleConfirmCrop} className="mr-2">Confirm</Button>
                        <Button variant="outline" onClick={handleCancelCrop}>Cancel</Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/*  */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[90%] sm:max-w-[500px] p-6 mx-auto max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Basic Details</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your Name"
                                required
                                className="w-full"
                                value={formData.name}
                                onChange={(e) => handleInputChange(e, 'name')}
                            />
                        </div>

                        {/* Current Location */}
                        <div>
                            <Label>Current Location</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                This helps us match you to relevant jobs.
                            </DialogDescription>
                            <div className="relative">
                                <Input
                                    id="location"
                                    placeholder="Enter location"
                                    required
                                    className="w-full mt-2"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange(e, 'location')}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 bg-transparent border-none">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    onClick={() => { fetchGeo('current') }}
                                                    disabled={geoLoading}
                                                // variant='ghost'

                                                >
                                                    {geoLoading === true ? (
                                                        <LoaderCircle
                                                            size={14}
                                                            color="black"
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <MapPinHouse size={13} />
                                                    )}

                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Fetch Your Current Location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Number with Send OTP Button */}
                        <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                Recruiters will contact you on this number.
                            </DialogDescription>
                            <div className="flex gap-2 flex-col">
                                <Input
                                    id="mobile"
                                    placeholder="Your mobile number"
                                    required
                                    className="w-full"
                                    value={formData.mobile}
                                    onChange={(e) => handleInputChange(e, 'mobile')}
                                />
                                {(formData.mobile !== "" &&
                                    (formData.mobile !== verifiedMobile || mobileVerified === false)) &&
                                    (otpLoadingtwo ? (
                                        <LoaderCircle size={24} className="animate-spin" />
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="w-fit"
                                            onClick={() => sendSMS(`+91${formData.mobile}`)}
                                        >
                                            Verify Number?
                                        </Button>
                                    ))}
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                We will send relevant jobs and updates to this email.
                            </DialogDescription>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Your email address"
                                required
                                className="w-full"
                                value={formData.email}
                                onChange={(e) => handleInputChange(e, 'email')}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <Label>Gender</Label>
                            <div className="flex gap-4 mt-2">
                                <RadioGroup
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange({ target: { value } }, 'gender')}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex items-center">
                                            <RadioGroupItem value="male" id="male" />
                                            <Label htmlFor="male" className="ml-2">Male</Label>
                                        </div>
                                        <div className="flex items-center">
                                            <RadioGroupItem value="female" id="female" />
                                            <Label htmlFor="female" className="ml-2">Female</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Present Location */}
                        <div>
                            <Label>Present Location</Label>
                            <div className="relative">
                                <Input
                                    id="present-location"
                                    placeholder="Enter present location"
                                    required
                                    className="w-full mt-2 pr-10" // Add padding to the right to avoid overlap with the icon
                                    value={formData.presentLocation}
                                    onChange={(e) => handleInputChange(e, 'presentLocation')}
                                />

                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700 bg-transparent border-none">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>

                                                <button
                                                    onClick={() => { fetchGeo('present') }}
                                                    disabled={geoLoading}
                                                // variant='ghost'

                                                >
                                                    {geoLoading === true ? (
                                                        <LoaderCircle
                                                            size={14}
                                                            color="black"
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <MapPinHouse size={13} />
                                                    )}

                                                </button>

                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Fetch Your Current location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                            </div>
                        </div>

                        {/* Expected Location */}
                        <div>
                            <Label>Expected Location</Label>
                            <Input
                                id="expected-location"
                                placeholder="Enter expected location"
                                required
                                className="w-full mt-2"
                                value={formData.expectedLocation}
                                onChange={(e) => handleInputChange(e, 'expectedLocation')}
                            />
                        </div>

                        {/* Availability to Join */}
                        <div>
                            <Label>Expected date of joining</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                Let recruiters know your availability to join.
                            </DialogDescription>
                            <Input
                                type="date"
                                className="w-full mt-2"
                                value={formData.availability}
                                onChange={(e) => handleInputChange(e, 'availability')}
                            />
                        </div>

                        {/* Layoff or Notice Period */}
                        <div>
                            <Label>Employment Status</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                Specify your current employment status.
                            </DialogDescription>
                            <div className="flex gap-4 mt-2">
                                <RadioGroup
                                    value={formData.employmentStatus}
                                    onValueChange={(value) => handleInputChange({ target: { value } }, 'employmentStatus')}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex items-center">
                                            <RadioGroupItem value="layoff" id="layoff" />
                                            <Label htmlFor="layoff" className="ml-2">Layoff</Label>
                                        </div>
                                        <div className="flex items-center">
                                            <RadioGroupItem value="notice-period" id="notice-period" />
                                            <Label htmlFor="notice-period" className="ml-2">Notice Period</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            {formData.employmentStatus === "notice-period" && (
                                <Select
                                    value={formData.noticePeriod}
                                    onValueChange={(value) => handleInputChange({ target: { value } }, 'noticePeriod')}
                                >
                                    <SelectTrigger className="w-full mt-2">
                                        <SelectValue placeholder="Select notice period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15 Days">15 Days</SelectItem>
                                        <SelectItem value="1 Month">1 Month</SelectItem>
                                        <SelectItem value="2 Months">2 Months</SelectItem>
                                        <SelectItem value="3 Months">More Than 3 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {formData.employmentStatus === "layoff" && (
                                <div className="mt-4">
                                    <Label htmlFor="layoff-date">Date of Layoff</Label>
                                    <Input
                                        id="layoff-date"
                                        type="date"
                                        className="w-full mt-2"
                                        value={formData.layoffDate}
                                        onChange={(e) => handleInputChange(e, 'layoffDate')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Interested in Job Type */}
                        <div>
                            <Label>Interested in Job Type</Label>
                            <Select
                                value={formData.jobType}
                                onValueChange={(value) => handleInputChange({ target: { value } }, 'jobType')}
                            >
                                <SelectTrigger className="w-full mt-2">
                                    <SelectValue placeholder="Choose job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="work-from-home">Work from Home</SelectItem>
                                    <SelectItem value="work-from-office">Work from Office</SelectItem>
                                    <SelectItem value="work-from-hybrid">Work from Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-4">
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="bg-white  rounded-[20px] shadow-[0_0_20px_#e6e6e6b5]  pl-[30px] pr-5 py-5  w-[1149px] h-[265px] mx-auto flex items-center justify-around space-x-8">
                <div className="w-[9rem] flex items-center space-x-6 overflow-hidden" onClick={handleImageClick}>
                    {/* Profile Image and Progress Ring */}
                    <CircularProgressbarWithChildren
                        counterClockwise={true}
                        strokeWidth={4}
                        value={progress}
                        styles={{
                            path: { stroke: `#f05537`, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.5s ease 0s' },
                            trail: { stroke: '#f7f7f9', strokeLinecap: 'round' },
                        }}
                    >
                        <div className='flex items-center justify-center h-0 p-[13px] top-[123px] rounded-[10px] absolute bg-white z-10 shadow-md'>
                            <span className="text-[#f05537] font-bold">{progress}%</span>
                        </div>
                        <div className="relative w-[127px] h-[127px]">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            {
                                userDetail?.photoURL ? (<Image
                                    src={userDetail?.photoURL} // Default avatar if no image is available
                                    width={170}
                                    height={160}
                                    // onClick={handleImageClick}
                                    className="rounded-full object-cover"
                                />
                                ) : (
                                    <Skeleton className="w-[129px] h-[126px] rounded-full" />
                                )
                            }

                            {/* <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            /> */}
                            <div
                                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 backdrop-blur-md cursor-pointer"
                            // onClick={handleImageClick}
                            >
                                <FaCamera className="text-white text-3xl" />
                            </div>
                        </div>
                    </CircularProgressbarWithChildren>

                </div>

                {/* User Information */}
                <div style={{
                    marginLeft: "-28px",
                }}>
                    <span className="flex"><h1 className="text-2xl font-semibold">{userDetail?.name || <Skeleton className="w-[100px] h-[20px] rounded-sm" />
                    }</h1>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger> <Pencil size={17} className="ml-2" onClick={() => setOpen(true)} /></TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit Details</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </span>
                    <span className="text-sm mt-1 flex "> <p className="text-[#7e85a1] mr-1">Profile last updated - {lastUpdatedDisplay || < Skeleton className="w-[100px] h-[20px] rounded-full" />} </p>
                    </span>
                    <hr className="mt-5 mb-5" />
                    <div className="flex flex-row justify-between gap-8 ">
                        <div className="wrapper">
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><MapPinHouse size={15} color="#474d6a" /> {userDetail?.location || <Skeleton className="w-[100px] h-[20px] rounded-full" />}</p>
                            {/* <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><BriefcaseBusiness size={15} color="#474d6a" /> {<Skeleton className="w-[100px] h-[20px] rounded-full" />}</p> */}

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>

                                        <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]">
                                            <Calendar size={15} color="#474d6a" />  {userDetail?.availability || <Skeleton className="w-[100px] h-[20px] rounded-full" />}</p>

                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Expected date of joining</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><Phone size={15} color="#474d6a" />
                                {userDetail?.mobile || <Skeleton className="w-[100px] h-[20px] rounded-full" />
                                }
                                {mobileVerified === true ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger> <BadgeCheck color="#0011ff" size={18} /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Verified</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>  <CircleAlert size={18} color="#ff0000" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Not Verified!!!</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </p>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><Mail size={15} color="#474d6a" />
                                {userDetail?.email || <Skeleton className="w-[100px] h-[20px] rounded-full" />}
                                {userDetail?.emailVerified === true ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger> <BadgeCheck color="#0011ff" size={18} /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Verified

                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>  <CircleAlert size={18} color="#ff0000" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Not Verified!!!</p>
                                                <Button onClick={() => sendVerificationEmail()}>
                                                    Verify?
                                                </Button>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>)}
                            </p>
                        </div>
                    </div>
                    {/* <CircleAlert /> */}
                </div>
                {/* Sidebar with Profile Suggestions */}
                {unfilledFields.length > 0 ? (

                    <div className="w-[380px] shadow-none h-[225px] bg-[#FFF2E3] overflow-hidden overflow-y-auto relative m-0 p-5 rounded-[10px]">
                        <div className="h-[128px] border-none">
                            {/* items */}
                            {unfilledFields.map((field, index) => (
                                <div className="flex justify-between mb-3" key={index}>
                                    <div className="flex gap-2 items-center justify-center">
                                        <span className="bg-white rounded-full p-2 items-center">
                                            <MapPinHouse size={20} color="black" />
                                        </span>
                                        <span className="capitalize text-sm">

                                            {field} is missing
                                        </span>
                                    </div>
                                    <span></span>
                                </div>

                            ))}
                            {/* BUTTON */}
                            {/* <div className="flex items-center justify-center">
                                <button
                                    // onClick={handleScrollToFirstMissingField}
                                    className="h-10 font-bold text-white m-auto px-3.5 py-2.5 rounded-[60px] bg-[#f05537]">Add  {unfilledFields.length} missing details</button>
                            </div> */}
                        </div>
                    </div>
                ) : (
                    <div className="w-[380px] shadow-none h-[225px] bg-[#fff] relative m-0 p-5 rounded-[10px]"> </div>
                )}

            </div>
            <div className="flex flex-row justify-evenly pl-[30px] pr-5 py-5 ">
                {comploading ? (
                    <Skeleton className="w-[242px] h-[539px] rounded-lg" />

                ) : (
                    <QuickLinks handleDialogOpen={handleDialogOpen} />
                )}
                <div className="flex flex-col gap-3">
                    <ResumeSection />
                    {links.map((item) => (
                        comploading ? (
                            <Skeleton className="w-[860px] h-[108px] rounded-lg" key={item.id} />
                        ) : (
                            <Info
                                key={item.id}
                                headline={item.headline}
                                link={item.link}
                                description={item.description}
                                onLinkClick={() => handleDialogOpen(item.id)}
                            />
                        )

                    ))}
                    {/* Dynamic Dialog Rendering */}
                    {openDialog && (
                        <Dialog open={!!openDialog} onOpenChange={handleDialogClose}>
                            <DialogContent className="max-w-[90%] sm:max-w-[500px] p-6 mx-auto max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {links.find(link => link.id === openDialog)?.headline || "Edit Details"}
                                    </DialogTitle>
                                </DialogHeader>

                                <form>
                                    {openDialog === 'keySkills' ? (
                                        <KeySkillsInput skills={dialogdata.skills || []} setSkills={(skills) => {
                                            setDialogData((prev) => ({ ...prev, skills }))
                                            console.log(skills);
                                        }
                                        } />
                                    ) : openDialog === 'employment' ? (
                                        <></>
                                    ) : (
                                        links.find(link => link.id === openDialog)?.fields?.map((field) => (
                                            <div key={field.id}>
                                                <Label htmlFor={field.id}>{field.label}</Label>
                                                <Input
                                                    id={field.id}
                                                    placeholder={field.placeholder}
                                                    value={dialogdata[field.id] || ""}
                                                    onChange={(e) => setDialogData((prev) => ({
                                                        ...prev,
                                                        [field.id]: e.target.value,
                                                    }))}
                                                    autoFocus={false}
                                                    maxLength={field.maxLength}
                                                    className="w-full"
                                                />
                                                {field.maxLength && (
                                                    <p className="text-right text-gray-500 text-xs mt-1">
                                                        {field.maxLength - (dialogdata[field.id]?.length || 0)} character(s) left
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="button" variant="outline" onClick={handleDialogClose}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const link = links.find(link => link.id === openDialog);
                                                if (link && link.save) {
                                                    link.save(dialogdata);
                                                }
                                                handleDialogClose();
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                    )}
                    {/* OTP Dialog */}
                    <Dialog open={isOtpDialogOpen} onOpenChange={() => setIsOtpDialogOpen(!isOtpDialogOpen)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enter OTP</DialogTitle>
                                <div>OTP sent to {tempNumber}</div>
                            </DialogHeader>
                            <div className='flex items-center justify-center '>
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(value) => setOtp(value)}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <DialogFooter style={{
                                flexDirection: 'column',
                            }} >
                                <Button
                                    onClick={handleOTPSubmit}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? (
                                        <LoaderCircle size={24} className="animate-spin" />
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>
                                <div className="text-xs text-center mt-4">
                                    Resend OTP in {countdown} seconds
                                    <br />
                                    <Button
                                        className="mt-2"
                                        variant='link'
                                        onClick={() => sendSMS(`+91${formData.mobile}`)}
                                        disabled={isResendDisabled}
                                    >
                                        Resend OTP
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div >
    )
}

export default Page

const Info = ({ headline, link, description, onLinkClick }) => (
    <div className="bg-white rounded-lg shadow-[0_0_20px_#e6e6e6b5] p-6 h-fit w-[860px] pb-8">
        <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{headline}</h2>
            <span
                onClick={onLinkClick}
                className="float-right text-[#275df5] font-bold text-base cursor-pointer"
            >
                {link}
            </span>
        </div>
        <p className="text-sm text-[#474d6a] mt-2">
            {description}
        </p>
    </div>
);

function QuickLinks({ handleDialogOpen }) {
    const quickLinks = [
        { id: 'resume', label: 'Resume', action: 'Upload' },
        { id: 'resumeHeadline', label: 'Resume headline', action: 'Add' },
        { id: 'keySkills', label: 'Key skills', action: 'Add' },
        // { id: 'Employment', label: 'Employment', action: 'Add' },
        { id: 'profileSummary', label: 'Profile summary', action: 'Add' },
    ];

    return (
        <div className="bg-white rounded-lg border  border-solid border-[#e7e7f1] w-[242px] max-h-[539px] h-[539px] p-6" style={{
            position: 'sticky',
            top: '96px', // Adjust based on your nav height
            alignSelf: 'start',
        }}>
            <h3 className="text-lg font-semibold mb-4">Quick links</h3>
            <ul className="space-y-2">
                {quickLinks.map((link) => (
                    <li
                        key={link.id}
                        className="flex justify-between"
                        style={{ marginTop: '21px', marginBottom: '21px' }}
                    >
                        <span className="text-sm">{link.label}</span>
                        {link.action && (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (link.id === 'resume') {
                                        document.getElementById('resumeFileInput').click();
                                        // Trigger upload function for Resume
                                    } else {
                                        handleDialogOpen(link.id); // Open dialog for others
                                    }
                                }}
                                className="font-semibold text-sm text-[#275df5]"
                            >
                                {link.action}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}


function ResumeSection() {
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [uploadDate, setUploadDate] = useState(null);
    const [downloadableURL, setDownloadableURL] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resumeloading, setresumeloading] = useState(true);
    const { toast } = useToast();
    // const { sectionRefs, populateRefs } = useSectionRefs();

    // Initialize refs
    // useEffect(() => {
    //     const fields = ["resumeHeadline", "resumePath", "uploadSection"];
    //     fields.forEach((field) => {
    //         if (!sectionRefs.current[field]) {
    //             sectionRefs.current[field] = React.createRef();
    //         }
    //     });
    // }, [sectionRefs]);

    // Fetch resume status
    useEffect(() => {
        setresumeloading(true);
        const fetchResumeStatus = async (user) => {
            try {
                const storagePath = `usersResume/${user.uid}/`;
                const storageRef = ref(storage, storagePath);

                const listResult = await listAll(storageRef);

                if (listResult.items.length > 0) {
                    setIsUploaded(true);
                    const fileName = listResult.items[0].name;
                    setUploadedFileName(fileName);
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUploadDate(data.resume.updatedate);
                        setDownloadableURL(data.resume.resumepath);
                    }
                }
                setresumeloading(false);
            } catch (error) {
                setresumeloading(false);
                console.error("Error checking resume status:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchResumeStatus(user);
            } else {
                console.error("User not authenticated.");
            }
        });

        return () => unsubscribe();
    }, []);
    const handleFileUploadClick = () => {
        document.getElementById('resumeFileInput').click();
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            handleUploadResume(file);
        }
    };

    const handleUploadResume = async (file) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("No authenticated user found.");
            return;
        }

        try {
            const storagePath = `usersResume/${user.uid}/${file.name}`;
            const storageRef = ref(storage, storagePath);

            // Delete any existing files
            const listResult = await listAll(storageRef.parent);
            for (const item of listResult.items) {
                await deleteObject(item);
            }

            const uploadTask = uploadBytesResumable(storageRef, file);
            setIsUploading(true);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                },
                (error) => {
                    toast({ variant: "destructive", title: "Upload failed", description: error.message });
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const uploadDate = new Date().toISOString();
                    await updateDoc(doc(db, "users", user.uid), {
                        lastUpdated: new Date(),
                        resume: {
                            resumepath: downloadURL,
                            resumeheadline: null,
                            updatedate: uploadDate,
                        }
                    });
                    toast({ title: "Resume uploaded successfully" });
                    setIsUploaded(true);
                    setIsUploading(false);
                    window.location.reload();
                }
            );
        } catch (error) {
            toast({ variant: "destructive", title: "Upload failed", description: error.message });
        }
    };

    const deleteFile = async () => {
        const user = auth.currentUser;
        if (!user || !uploadedFileName) {
            console.error("No authenticated user found or no file to delete.");
            return;
        }

        try {
            const storagePath = `usersResume/${user.uid}/${uploadedFileName}`;
            const storageRef = ref(storage, storagePath);

            await deleteObject(storageRef);
            await updateDoc(doc(db, "users", user.uid), {
                lastUpdated: new Date(),
                resume: {
                    resumepath: null,
                    resumeheadline: null,
                    updatedate: null,
                }
            });

            toast({ title: "Resume deleted successfully" });
            setIsUploaded(false);
            setUploadedFileName(null);
            setDownloadableURL(null);
            setUploadDate(null);
        } catch (err) {
            toast({ variant: "destructive", title: "Delete failed", description: err.message });
        }
    };
    const handleDownload = async () => {
        try {
            const url = downloadableURL; // Get the download URL from Firebase

            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob'; // Expect a Blob in the response
            xhr.onload = () => {
                const blob = xhr.response;

                // Convert the Blob into an object URL
                const objectUrl = URL.createObjectURL(blob);

                // Using the FileReader to read the Blob and initiate a download
                const reader = new FileReader();
                reader.onloadend = () => {
                    const downloadFileName = uploadedFileName; // Desired file name for download
                    const fileBlob = reader.result;

                    // Create an invisible link, set href to the object URL, and trigger download
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = objectUrl;
                    link.download = downloadFileName;

                    document.body.appendChild(link);
                    link.click(); // Automatically starts download
                    document.body.removeChild(link);

                    // Clean up Blob URL to free up memory
                    URL.revokeObjectURL(objectUrl);
                };
                reader.readAsDataURL(blob); // Reads Blob as a data URL for download
            };

            xhr.open('GET', url);
            xhr.send();
        } catch (error) {
            console.error("Failed to download file:", error);
        }
    };
    return (
        <>
            {resumeloading ? (<Skeleton className="w-[860px] h-[256px] rounded-lg" />) : (
                <div className="bg-white rounded-lg shadow-[0_0_20px_#e6e6e6b5] p-6 h-fit w-[860px] pb-8"  >
                    {/* Header */}
                    < div className="flex items-center justify-between" >
                        <h2 className="text-base font-semibold">Resume</h2>
                    </div >


                    {/* Conditional Content based on upload status */}

                    {
                        !isUploaded ? (
                            <>
                                <p className="text-sm text-[#474d6a] mt-2">
                                    70% of recruiters discover candidates through their resume
                                </p>
                                <div
                                    className="flex h-[106px] justify-center items-center flex-col border-[0.3px] border-dashed cursor-pointer mt-3.5 rounded-[10px]"
                                    onClick={handleFileUploadClick}
                                >
                                    <p className="text-gray-600">
                                        Already have a resume?{' '}
                                        <span className="text-[#275df5] font-semibold">
                                            Upload resume
                                        </span>
                                    </p>
                                    {isUploading && (
                                        // <Progress value={progress} className="w-[375px]" />
                                        { progress }
                                    )}
                                    <p className="text-[#717b9e] text-sm">
                                        Supported Formats: doc, docx, rtf, pdf, up to 2 MB
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-[#474d6a] mt-2">
                                            {
                                                uploadedFileName
                                            }
                                        </p>
                                        <p className="text-sm text-[#474d6a] mt-2">Upload On: {uploadDate ? new Date(uploadDate).toLocaleString() : "Unknown"}</p>
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        <button onClick={handleDownload} className="flex justify-center items-center w-[38px] h-[37px] m-0 p-0 bg-[#f7f7f9] rounded-full cursor-pointer">
                                            <CloudDownload size={20} color="#275df5" />
                                        </button>
                                        <div className="flex justify-center items-center w-[38px] h-[37px] m-0 p-0 bg-[#f7f7f9] rounded-full cursor-pointer" onClick={deleteFile}>
                                            <Trash2 size={20} color="#275df5" />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="flex h-[106px] justify-center items-center flex-col border-[0.3px] border-dashed cursor-pointer mt-3.5 rounded-[10px]"
                                    onClick={handleFileUploadClick}
                                >
                                    <p className="text-gray-600">
                                        <span className="text-[#275df5] font-semibold">
                                            Update Resume
                                        </span>
                                    </p>
                                    {isUploading && (
                                        // <Progress value={progress} className="w-[375px]" />
                                        { progress }

                                    )}
                                    <p className="text-[#717b9e] text-sm">
                                        Supported Formats: doc, docx, rtf, pdf, up to 2 MB
                                    </p>
                                </div>
                            </>
                        )
                    }

                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="resumeFileInput"
                        accept=".doc,.docx,.rtf,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

            )}

        </>
    );


}


const getCroppedImg = async (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
        const image = document.createElement('img'); // Create an img element
        image.src = imageSrc;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            // Convert to a base64 string with JPEG format
            const base64Image = canvas.toDataURL('image/jpeg', 0.95);
            resolve(base64Image);
        };

        image.onerror = (error) => {
            reject(error);
        };
    });
};

const KeySkillsInput = ({ skills, setSkills }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === ',' && input.trim() !== '') {
            e.preventDefault();
            setSkills([...skills, input.trim()]);
            setInput('');
        }
    };

    const removeSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    return (
        <div>
            <Label htmlFor="skills">Key Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                    <div
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center space-x-2"
                    >
                        <span>{skill}</span>
                        <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            <Input
                id="skills"
                placeholder="Enter your skills and press ','"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-4 w-full"
            />
        </div>
    );
};
