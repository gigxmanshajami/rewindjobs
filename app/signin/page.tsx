// @ts-nocheck 
"use client";
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import cookies from 'js-cookie';
import { LoaderCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const SignIn = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log('User already signed in');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const { email, password } = formData;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Store the token in a cookie (expires in 1 day)
      cookies.set('token', idToken, { expires: 1 });
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        toast({ title: "Success!", description: "You've been successfully logged in." });
        router.push("/profile");
      } else {
        toast({ title: "User does not exist. Please sign up first." });
        await signOut(auth);
      }

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem with your request.",
      });
      console.error("Error signing in:", err);
    } finally {
      setLoading(false);
    }
  };

  const googleSign = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const credential = await signInWithPopup(auth, provider);
      const user = credential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const idToken = await user.getIdToken();

      // Store the token in a cookie (expires in 1 day)
      cookies.set('token', idToken, { expires: 1 });
      if (userDocSnap.exists()) {
        toast({ title: "User signed in successfully" });
        router.push("/profile");
      } else {
        await signOut(auth);
        toast({ title: "User not registered. Please sign up first." });
      }
    } catch (err) {
      console.error("Error during Google Sign-In:", err.code);
      toast({
        variant: "destructive",
        title: "Error during Google Sign-In",
        description: "Please try again.",
      });
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
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password below to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
              <Link href="#" className="text-sm underline mt-1 block text-right">
                Forgot your password?
              </Link>
            </div>
            <Button type="submit" className="w-full">

              {loading ? <LoaderCircle className="animate-spin mr-2" /> : "Sign In"}
            </Button>
            <Button variant="outline" className="w-full" onClick={googleSign}>
              Sign in with Google

            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
