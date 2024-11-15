import { Disclosure } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Drawer from "./Drawer";
import Drawerdata from "./Drawerdata";
import Image from 'next/image';
import Signdialog from "./Signdialog";
import Registerdialog from "./Registerdialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, db } from '../../firebase/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { ToastAction } from "@/components/ui/toast"
// import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuShortcut,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast"

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [scrolled, setScrolled] = useState(false); // Track scroll state
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
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
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
            router.push('/signin');
        } catch (err) {
            console.error("Error during logout:", err);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        }
    };



    return (
        <Disclosure as="nav" className={`bg-white sticky top-0 inset-x-0 z-10 ${scrolled ? 'shadow-[0_0_20px_#e6e6e6b5]' : 'shadow-none'}`}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative flex h-20 items-center justify-between">
                    {/* LOGO */}
                    <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
                        <Link href={'/'}>
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

                    {/* Display loading state or user avatar */}
                    {loading ? (
                        <div>Loading...</div>
                    ) : loggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar>
                                    <AvatarImage
                                        src={userDetail?.photoURL || auth.currentUser?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mr-8">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <Link href={'/profile'}>
                                        <DropdownMenuItem>
                                            Profile
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>New Team</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>GitHub</DropdownMenuItem>
                                <DropdownMenuItem>Support</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    Log out
                                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Signdialog />
                            <Registerdialog />
                        </div>
                    )}

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
        </Disclosure >
    );
};

export default Navbar;
