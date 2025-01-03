// @ts-nocheck 
"use client";
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const SignIn = () => {
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/profile')
        console.log('user not logged in')
      }
    })
  }, [])
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingtwo, setLoadingtwo] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

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
  const forgotPassword = async () => {
    setLoadingtwo(true)

    if (!email) {
      setLoadingtwo(false)
      toast({ variant: 'destrcutive', title: "Empty Mail", description: "Please Enter Your Email " });
      return;
    }


    try {
      // Check if the user exists in Firebase Auth
      // const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      // console.log(signInMethods,'');
      // if (signInMethods.length === 0) {
      //   setLoadingtwo(false)
      //   toast({ variant: 'destructive', title: "Invalid Email!", description: "No account found with this email address." });
      //   return;
      // }

      // Send the password reset email
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Success!", description: "Email Sent Successfully! Please check your inbox" });
      setIsOpen(false); // Close dialog after successful submission
      setLoadingtwo(false)
      return { error: null };
    } catch (err) {
      setLoadingtwo(false)
      toast({ variant: 'destrcutive', title: "Failed", description: "Something Went Wrong while generating the forgot link " });
    }


  }
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
    <div className="flex w-full  justify-center px-4 bg-[#f8f9fa] p-4 h-fit">
      {/* <div className='flex justify-center items-center flex-col pl-40 pb-44'>
        <h2 className='text-[28px] text-[#414b5d]'>
          Hire talent with RewindJobs
        </h2>
        <span className='text-[#414b5d]'> Find, engage, and hire talent on India’s leading recruitment platform</span>
        <Image src={'/assets/auth.svg'} priority width={200} height={200} alt="image" />
      </div> */}
      <Card className="mx-auto max-w-sm shadow-none rounded-lg h-fit">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
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
            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  className="w-full pr-10"
                />
                <span
                  className="absolute right-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>


              <Dialog open={isOpen} onOpenChange={setIsOpen} >
                {/* Button to trigger the dialog */}

                <div onClick={setIsOpen} className="text-sm cursor-pointer underline mt-1 block text-right">
                  Forgot your password?
                </div>


                {/* Dialog Content */}
                <DialogContent className="sm:max-w-[425px] rounded-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-center">
                      Forgot Password
                    </DialogTitle>
                  </DialogHeader>

                  {/* Input Field for Email */}
                  <div className="flex flex-col gap-4 mt-4">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Enter your email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg"
                    />
                    <Button
                      onClick={forgotPassword}
                      disabled={!email}
                      className="w-full bg-black  text-white rounded-lg"
                    >
                      {loadingtwo ? <LoaderCircle className="animate-spin mr-2" /> : "Submit"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button type="submit" className={`w-full ${!formData.email || !formData.password ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!formData.email || !formData.password}>

              {loading ? <LoaderCircle className="animate-spin mr-2" /> : "Login"}
            </Button>
            <Button variant="outline" className="w-full " onClick={googleSign}>
              <Image src={'/assets/g.svg'} width={20} height={20} alt='google' />
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/registration" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
