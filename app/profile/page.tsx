"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { auth, db, storage } from "../firebase/firebase";
import { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, getAuth, PhoneAuthProvider, signInWithCredential, RecaptchaVerifier, linkWithCredential, reauthenticateWithCredential, updateProfile } from "firebase/auth";
import { ref, deleteObject, listAll, uploadBytes, getDownloadURL, uploadBytesResumable, } from "firebase/storage";
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import Link from 'next/link';
import { FaCamera } from "react-icons/fa";
import { MapPinHouse, Pencil, BriefcaseBusiness, Calendar, Phone, Mail } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import nprogress from 'nprogress';
type Props = {}

const page = (props: Props) => {

    const [open, setOpen] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [originalFileName, setOriginalFileName] = useState({ name: '', type: '' }); // Store original file name
    const fileInputRef = useRef(null);
    const [cropping, setCropping] = useState(false);
    const [cropArea, setCropArea] = useState(null);
    const [verificationId, setVerificationId] = useState(null);
    const [otp, setOtp] = useState("");
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
                    nprogress.start();
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                    nprogress.set(progress);
                },
                (err) => {
                    console.error("Upload error:", err);
                },
                async () => {
                    console.log("Upload complete");
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File available at", downloadURL);

                    // Update Firestore user profile URL
                    await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
                    // updating the auth data
                    updateProfile(auth.currentUser, {
                        photoURL: downloadURL,
                    }).then(() => console.log('changed')).catch(err => {
                        throw new Error('Something went wrong while upadting the auth', err);
                    });
                    // Show a toast message and reload the page
                    toast({ title: "Image uploaded successfully" });
                    nprogress.done(true);
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

    const handleCancelCrop = () => {
        setSelectedImage(null); // Clear selected image
        setCropping(false); // Close cropping dialog
    };

    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        mobile: "",
        email: "",
        availability: "1 Month"
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

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
                await updateDoc(userDocRef, {
                    name: formData.name,
                    location: formData.location,
                    mobile: formData.mobile,
                    email: formData.email,
                    availability: formData.availability
                });
                toast({ title: "Profile updated successfully!" });
                setOpen(false);
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
    const setupRecaptchaAndSendOTP = async (phoneNumber) => {
        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
                    size: 'invisible',
                    callback: (response) => {
                        console.log("ReCAPTCHA solved, ready to send OTP.");
                    },
                }, auth);
            }

            const appVerifier = window.recaptchaVerifier;

            await appVerifier.render();  // Ensure it renders properly
            console.log("ReCAPTCHA rendered.");

            const provider = new PhoneAuthProvider(auth);
            const verificationId = await provider.verifyPhoneNumber(phoneNumber, appVerifier);

            console.log("Verification ID received:", verificationId);
            setVerificationId(verificationId);
            toast({ title: "OTP sent successfully" });
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast({
                variant: "destructive",
                title: "Failed to send OTP",
                description: error.message || "Could not send OTP",
            });
        }
    };

    // Function to verify OTP
    const verifyOTP = async () => {
        if (!verificationId || !otp) {
            toast({
                variant: "destructive",
                title: "Invalid input",
                description: "Please enter a valid OTP",
            });
            return;
        }
        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            // Instead of signing in, just verify the OTP
            // const result = await reauthenticateWithCredential(auth,credential);    
            // if (result) {
            //     // Update Firestore with the verified phone number
            //     const userDocRef = doc(db, "users", auth.currentUser.uid);
            //     await updateDoc(userDocRef, {
            //         mobile: formData.mobile, // assuming formData.mobile contains the verified number
            //         phoneVerified: true
            //     });

            //     
            // }
            toast({ title: "Phone number verified successfully!" });
        } catch (error) {
            console.error("Error verifying OTP:", error);
            toast({
                variant: "destructive",
                title: "OTP Verification Failed",
                description: error.message || "The OTP entered is incorrect",
            });
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUserDetail(userData);

                    setFormData({
                        name: userData.name || "",
                        location: userData.location || "",
                        mobile: userData.mobile || "",
                        email: userData.email || "",
                        availability: userData.availability || "1 Month"
                    });

                    // Trigger OTP once user details are loaded
                    // Replace with the correct phone number
                }
            } else {
                setUserDetail(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (

        <div className="bg-[#f8f9fa] py-[15rem] flex flex-col justify-center gap-[0.9rem] px-4 pt-[2rem]">
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[90%] sm:max-w-[500px] p-6 mx-auto max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Basic Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" required className="w-full" value={formData.name} onChange={handleInputChange} />
                        </div>

                        {/* Current Location */}
                        <div>
                            <Label>Current Location</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                This helps us match you to relevant jobs.
                            </DialogDescription>
                            <Input id="location" placeholder="Enter location" required className="w-full mt-2" value={formData.location} onChange={handleInputChange} />
                        </div>

                        {/* Mobile Number with Send OTP Button */}
                        <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                Recruiters will contact you on this number.
                            </DialogDescription>
                            <div className="flex gap-2">
                                <Input
                                    id="mobile"
                                    placeholder="Your mobile number"
                                    required
                                    className="w-full"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                />
                                <Button
                                    type="button"
                                    onClick={() => setupRecaptchaAndSendOTP(`+91${formData.mobile}`)}
                                >
                                    Send OTP
                                </Button>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div>
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                                id="otp"
                                placeholder="Enter OTP"
                                required
                                className="w-full"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={verifyOTP}
                                className="mt-2"
                            >
                                Verify OTP
                            </Button>
                        </div>

                        {/* Email Address */}
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                We will send relevant jobs and updates to this email.
                            </DialogDescription>
                            <Input id="email" type="email" placeholder="Your email address" required className="w-full" value={formData.email} onChange={handleInputChange} />
                        </div>

                        {/* Availability to Join */}
                        <div>
                            <Label>Availability to Join</Label>
                            <DialogDescription className="text-sm text-gray-500">
                                Lets recruiters know your availability to join.
                            </DialogDescription>
                            <RadioGroup value={formData.availability} onValueChange={handleAvailabilityChange} className="flex flex-col space-y-2 mt-2 sm:flex-row sm:space-y-0 sm:space-x-4 flex-wrap">
                                {["15 Days or less", "1 Month", "2 Months", "3 Months", "More than 3 Months"].map((time) => (
                                    <div key={time} className="flex items-center space-x-2">
                                        <RadioGroupItem id={time} value={time} />
                                        <Label htmlFor={time}>{time}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-4">
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>


            <div className="bg-white  rounded-[20px] shadow-[0_0_20px_#e6e6e6b5]  pl-[30px] pr-5 py-5  w-[1120px] h-[265px] mx-auto flex items-center justify-around space-x-8">
                {/* Profile Info Section */}
                <div className="w-[9rem] flex items-center space-x-6" onClick={handleImageClick}>
                    {/* Profile Image and Progress Ring */}
                    <CircularProgressbarWithChildren
                        counterClockwise={true}
                        strokeWidth={4}
                        value={66}
                        styles={{
                            path: { stroke: `#f05537`, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.5s ease 0s' },
                            trail: { stroke: '#f7f7f9', strokeLinecap: 'round' },
                        }}
                    >
                        <div className="relative w-[127px] h-[127px]">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            <Image
                                src={userDetail?.photoURL} // Default avatar if no image is available
                                alt="Avatar"
                                width={170}
                                height={160}
                                // onClick={handleImageClick}
                                className="rounded-full object-cover"
                            />
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
                    marginLeft: "-75px",
                }}>
                    <span className="flex"><h1 className="text-2xl font-semibold">{userDetail?.name}</h1>
                        <Pencil size={17} className="ml-2" onClick={() => setOpen(true)} />
                    </span>
                    <span className="text-sm mt-1 flex "> <p className="text-[#7e85a1] mr-1">Profile last updated</p>  - 20px </span>
                    <hr className="mt-5 mb-5" />
                    <div className="flex flex-row justify-between gap-8 ">
                        <div className="wrapper">
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><MapPinHouse size={15} color="#474d6a" /> {userDetail?.location}</p>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><BriefcaseBusiness size={15} color="#474d6a" /> Fresher</p>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><Calendar size={15} color="#474d6a" />  {userDetail?.availabilty}</p>
                        </div>

                        <div>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><Phone size={15} color="#474d6a" />
                                {userDetail?.mobile}</p>
                            <p className="text-[13px] flex gap-2.5 mt-[9px] text-[#474d6a]"><Mail size={15} color="#474d6a" />
                                {userDetail?.email}</p>
                        </div>
                    </div>
                </div>
                {/* Sidebar with Profile Suggestions */}
                <div className="w-[380px] shadow-none h-[225px] bg-[#FFF2E3] relative m-0 p-5 rounded-[10px]">
                    <div className="h-[128px] border-none">
                        {/* items */}
                        <div className="flex justify-between mb-3">
                            <div className="flex gap-2 items-center justify-center">
                                <span className="bg-white rounded-full p-2 items-center">
                                    <MapPinHouse size={20} color="black" />
                                </span>
                                <span>

                                    Add preferred location
                                </span>
                            </div>
                            <span></span>
                        </div>
                        <div className="flex justify-between mb-3">
                            <div className="flex gap-2 items-center justify-center">
                                <span className="bg-white rounded-full p-2 items-center">
                                    <MapPinHouse size={20} color="black" />
                                </span>
                                <span>

                                    Add preferred location
                                </span>
                            </div>
                            <span></span>
                        </div>
                        <div className="flex justify-between mb-3">
                            <div className="flex gap-2 items-center justify-center">
                                <span className="bg-white rounded-full p-2 items-center">
                                    <MapPinHouse size={20} color="black" />
                                </span>
                                <span>

                                    Add preferred location
                                </span>
                            </div>
                            <span></span>
                        </div>
                        {/* BUTTON */}
                        <div className="flex items-center justify-center">
                            <button className="h-10 font-bold text-white m-auto px-3.5 py-2.5 rounded-[60px] bg-[#f05537]">Add 10 missing details</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-evenly pl-[30px] pr-5 py-5 ">
                <QuickLinks />
                <ResumeSection />
            </div>
        </div>
    )
}

export default page
function QuickLinks() {
    const links = [
        { label: 'Resume', action: 'Upload' },
        { label: 'Resume headline', action: 'Add' },
        { label: 'Key skills', action: 'Add' },
        { label: 'Education', action: 'Add' },
        { label: 'IT skills', action: 'Add' },
        { label: 'Projects', action: 'Add' },
        { label: 'Profile summary', action: 'Add' },
        { label: 'Accomplishments', action: '' },
        { label: 'Career profile', action: '' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-[0_0_20px_#e6e6e6b5]  w-[242px] max-h-[539px] h-[539px]  p-6">
            <h3 className="text-lg font-semibold mb-4">Quick links</h3>
            <ul className="space-y-2">
                {links.map((link, index) => (
                    <li key={index} className="flex justify-between " style={{
                        marginTop:"21px",
                        margin
                    }}>
                        <span className="text-sm">{link.label}</span>
                        {link.action && (
                            <a href="#" className="font-semibold text-sm text-[#275df5]">
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
    const { toast } = useToast();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleFileUploadClick = () => {
        document.getElementById('resumeFileInput').click();
    };

    const handleUploadResume = async () => {
        // Add your upload logic here
        await uploadResume(resumeFile)
    };
    const uploadResume = async (resumeFile) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("No authenticated user found.");
            return;
        }

        try {
            // Define storage path for the resume
            const storagePath = `usersResume/${user.uid}/${resumeFile.name}`;
            const storageRef = ref(storage, storagePath); // Reference to the user's folder

            // List all files in the user's folder to delete any existing resumes
            const listResult = await listAll(storageRef);
            for (const item of listResult.items) {
                await deleteObject(item);
                console.log(`Deleted: ${item.fullPath}`);
            }

            // Set up reference and metadata for the new resume upload
            const newResumeRef = ref(storage, `${storagePath}/${resumeFile.name}`);
            const metadata = {
                contentType: resumeFile.type, // Set MIME type correctly
            };

            const uploadTask = uploadBytesResumable(newResumeRef, resumeFile, metadata);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                    nProgress.start();
                    nProgress.set(progress);
                },
                (err) => {
                    console.error("Upload error:", err);
                },
                async () => {
                    console.log("Upload complete");
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("Resume available at", downloadURL);

                    // Update Firestore user profile with resume URL
                    await updateDoc(doc(db, "users", user.uid), { resumeloc: downloadURL });

                    // Show a toast message
                    toast({ title: "Resume uploaded successfully" });
                    nProgress.done(true);
                }
            );
        } catch (error) {
            console.error("Error uploading resume:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error.message || "Failed to upload resume to Firebase",
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-[0_0_20px_#e6e6e6b5] p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Resume</h2>
                <p className="text-green-600 font-medium">Add 10%</p>
            </div>
            <p className="text-gray-600 mt-2">
                70% of recruiters discover candidates through their resume
            </p>

            {/* Create Resume Section */}
            <div className="w-[51em] bg-pink-50 rounded-lg p-4 mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Resume Thumbnail */}
                    <img
                        src="https://via.placeholder.com/70x100"
                        alt="Resume Thumbnail"
                        className="w-20 h-28 rounded"
                    />
                    {/* Steps */}
                    <div>
                        <h3 className="text-lg font-semibold">
                            Create your resume in 3 easy steps ✨
                        </h3>
                        <ul className="text-gray-600 text-sm mt-2 list-disc list-inside space-y-1">
                            <li>Add the missing details in your profile</li>
                            <li>Choose a template for your resume</li>
                            <li>Improve the content with AI</li>
                        </ul>
                    </div>
                </div>
                {/* Create Resume Button */}
                <button className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold">
                    Create resume
                </button>
            </div>

            {/* Upload Resume Section */}
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-4 text-center cursor-pointer"
                onClick={handleFileUploadClick}
            >
                <p className="text-gray-600">
                    Already have a resume?{' '}
                    <span className="text-blue-600 font-semibold">
                        Upload resume
                    </span>
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    Supported Formats: doc, docx, rtf, pdf, up to 2 MB
                </p>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                id="resumeFileInput"
                accept=".doc,.docx,.rtf,.pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Upload Button (Visible after selecting a file) */}
            {resumeFile && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={handleUploadResume} className="bg-black text-white font-semibold">
                        Upload Resume
                    </Button>
                </div>
            )}
        </div>
    );
}

// Helper function for cropping the image
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