"use client";
import React, { useState } from 'react';
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';
import PhoneNumberPopup from '../components/PhoneNumberPopup';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';
const RegistrationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    resume: null,
  });

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
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        profileSummary: "",
        resume: {
          resumeheadline: "",
        },
        skills: {
          keys: [],
        },

      });

      toast.success("User Registered Successfully");
      router.push("/profile");
      setFormData({ fullName: '', email: '', mobile: '', password: '', resume: null });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': "User Already Exists",
      'default': "Uh oh! Something went wrong. Please try again.",
    };
    toast.error(errorMessages[error.code] || errorMessages['default']);
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
          mobile: user.phoneNumber || "",
        });
        toast.success("User Registered Successfully");
      } else {
        toast.success("User Logged In successfully");
      }

      router.push("/profile");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="flex w-full  justify-center px-4 bg-[#f8f9fa] p-4 h-[44rem]">
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
                type="number"
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
                placeholder="Password (min. 8 characters)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Resume</label>
              <Input
                type="file"
                name="resume"
                onChange={handleChange}

              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin mr-2" /> : "Register"}
            </Button>
            <Button variant="secondary" onClick={googleSignIn} className="w-full">
              Sign in with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div >
  );
};

export default RegistrationPage;
