// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Link from "next/link";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/firebase';
import Signdialog from "./Signdialog";
import Registerdialog from "./Registerdialog";
import { getDoc, doc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import cookies from 'js-cookie';
const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'Process', href: '/process', current: false },
  { name: 'About Us', href: '/aboutus', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Data = () => {
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoggedIn(true);
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserDetail(docSnap.data());
        }
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const logout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      toast({
        title: "Success",
        description: "User logged out successfully",
      });
      cookies.remove('token');
      router.push('/signin');
    } catch (err) {
      console.error("Error during logout:", err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };
  return (
    <div className="rounded-md max-w-sm w-full mx-auto">
      <div className="flex-1 space-y-4 py-1">
        <div className="sm:block">
          <div className="space-y-1 px-5 pt-2 pb-3">
            {loading ? (
              <Skeleton className="w-[40px] h-[40px] rounded-full" />
            ) : loggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage
                      src={
                        userDetail?.photoURL ||
                        auth.currentUser?.photoURL ||
                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                      }
                    />
                    <AvatarFallback>
                      <Skeleton className="w-[40px] h-[40px] rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-8">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={'/profile'}>
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Signdialog />
                <Registerdialog />
              </div>
            )}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current ? 'text-black hover:opacity-100' : 'hover:text-black hover:opacity-100',
                  'px-2 py-1 text-lg font-normal opacity-75 block'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4"></div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Data;
