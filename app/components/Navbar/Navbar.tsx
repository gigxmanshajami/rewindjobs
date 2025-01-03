// @ts-nocheck
import { Disclosure } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Drawer from "./Drawer";
import Drawerdata from "./Drawerdata";
import Signdialog from "./Signdialog";
import Registerdialog from "./Registerdialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, db } from '../../firebase/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import cookies from 'js-cookie';
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
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userDetail, setUserDetail] = useState({});
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Listen to authentication state changes
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

    // Add scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Logout functionality
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
        <Disclosure as="nav" className={`bg-white sticky top-0 inset-x-0 z-20 ${scrolled ? 'shadow-[0_0_20px_#e6e6e6b5]' : 'shadow-none'}`}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative flex h-20 items-center justify-between">
                    {/* LOGO */}
                    <div>
                        <Link href={'https://altezzasys.com/'} target='_blank'>
                            <div className="flex flex-shrink-0 items-center">
                                <img
                                    className="block h-12 w-40 lg:hidden"
                                    src={'/assets/logo/logo.png'}
                                    alt="Logo"
                                />
                                <img
                                    className="hidden h-full w-[66%] lg:block"
                                    src={'/assets/logo/logo.png'}
                                    alt="Logo"
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="flex gap-4 relative right-[113px]">
                        <Link href={'/'} className='hover:underline'>
                            Home
                        </Link>
                        <Link href={'/process'} className='hover:underline'>
                            How the process works
                        </Link>
                        <Link href={'/aboutus'} className='hover:underline'>
                            About Us
                        </Link>
                    </div>
                    <div>
                        {/* Display loading state or user avatar */}
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
                    </div>
                    {/* Drawer Icon for Mobile View */}
                    <div className="block lg:hidden">
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" onClick={() => setIsOpen(true)} />
                    </div>

                    {/* Drawer for Mobile View */}
                    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
                        <Drawerdata />
                    </Drawer>
                </div>
            </div>
        </Disclosure>
    );
};

export default Navbar;
