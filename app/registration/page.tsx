"use client";
import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"; // Import ShadCN OTP components

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';

const RegistrationPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingotp, setLoadingotp] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    resume: null,
  });
  const [otp, setOtp] = useState("");  // OTP state
  const [verificationId, setVerificationId] = useState("");  // Store Firebase OTP verification ID
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false); // Control dialog visibility
  const [countdown, setCountdown] = useState(40); // Countdown state for resend OTP
  const [isResendDisabled, setIsResendDisabled] = useState(false); // Disable resend after 40 seconds

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    const newOtp = otp.split(""); // Convert OTP string to array for easy modification
    newOtp[index] = value; // Update the specific index with the new value
    setOtp(newOtp.join("")); // Convert back to string and update state
  };

  const sendVerification = async () => {
    try {
      const phoneNumber = '+91' + formData.mobile;
      // Send the phone number to your backend API route to trigger OTP sending
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      const data = await response.json();

      setVerificationId(data.verificationId);  // Save the verification ID from Twilio
      setIsOtpDialogOpen(true);  // Automatically open the OTP dialog

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
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, trigger OTP process after collecting phone number
      await sendVerification();
    } catch (error) {
      setLoading(false);
      toast.error("Error sending OTP");
    }
  };

  const handleOTPSubmit = async () => {
    try {
      setLoadingotp(true);
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
        setLoadingotp(false);
        toast({
          title: "Verified",
          description: "Phone Number Verified successfully",
        });
        // Proceed with registration (or login) after OTP verification
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: formData.fullName,
          email: formData.email,
          mobileVerified: true,
          mobile: formData.mobile,
          profileSummary: "",
          resume: {
            resumeheadline: "",
          },
          skills: {
            keys: [],
          },
        });
        toast({
          title: "Registered",
          description: "User Registered Successfully! Redirecting....",
        });
        router.push("/profile");
        setFormData({ fullName: "", email: "", mobile: "", password: "", resume: null });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while verifying the otp",
        });
        setLoadingotp(false);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setLoadingotp(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying the otp",
      });
    }
  };

  const handleError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': "User Already Exists",
      'default': "Uh oh! Something went wrong. Please try again.",
    };
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessages[error.code],
    });
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          mobile: user.phoneNumber || "",
          mobileVerified: false,
          profileSummary: "",
          resume: {
            resumeheadline: "",
          },
          skills: {
            keys: [],
          },
        });
        // uid: user.uid,
        // name: formData.fullName,
        // email: formData.email,
        // mobileVerified: true,
        // mobile: formData.mobile,
        // profileSummary: "",
        // resume: {
        //   resumeheadline: "",
        // },
        // skills: {
        //   keys: [],
        // },
        toast({
          title: "Registered!",
          description: 'User Registered Successfully',
        });
      } else {
        toast({
          title: "Logged In",
          description: 'User Logged In Successfully',
        });
      }
      toast({
        title: "Redirecting...",
      });
      router.push("/profile");
    } catch (error) {
      handleError(error);
      console.log(error);
    }
  };

  return (
    <div className="flex w-full justify-center px-4 bg-[#f8f9fa] p-4 h-[44rem]">
      <div className='flex justify-center items-center flex-col pl-40 pb-44'>
        <h2 className='text-[28px] text-[#414b5d]'>
          Hire talent with RewindJobs
        </h2>
        <span className='text-[#414b5d]'> Find, engage, and hire talent on India’s leading recruitment platform</span>
        <Image src={'/assets/sigin.png'} priority width={300} height={300} alt="image" />
      </div>
      <Card className="mx-auto max-w-sm shadow-none rounded-lg h-fit">
        <CardHeader>
          <h2 className="text-2xl font-bold">Create your Profile</h2>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Mobile Number</label>
              <Input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Your mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <LoaderCircle size={24} className="animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>
            <Button type="submit" variant='ghost' className="w-full" onClick={googleSignIn}>
              Continue with google
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-between items-center">
          <span>Already have an account?</span>
          <Button onClick={() => router.push('/login')} variant="link">
            Log In
          </Button>
        </CardFooter>
      </Card>
      {/* OTP Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={() => setIsOtpDialogOpen(!isOtpDialogOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <div>OTP sent to +91{formData.mobile}</div>
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
              disabled={loadingotp}
            >
              {loadingotp ? (
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
                onClick={sendVerification}
                disabled={isResendDisabled}
              >
                Resend OTP
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationPage;
