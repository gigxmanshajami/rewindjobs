'use client'
import Image from "next/image";

import Link from 'next/link';
import Signdialog from "@/app/components/Navbar/Signdialog";
import Registerdialog from "@/app/components/Navbar/Registerdialog";
import IconCloud from "@/components/ui/icon-cloud";
import Marquee from "@/components/ui/marquee";
// import { VelocityScroll } from "@/components/ui/scroll-based-velocity";
import { cn } from '@/lib/utils';
const Banner = () => {
    return (
        <main
            className="grid lg:grid-cols-2 place-items-center lg:pt-0 pb-8 md:pt-12 md:pb-24 lg:p-10">
            <div className="md:order-1  h-auto  relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg">
                <Image
                    src={'/assets/hero.png'}
                    alt="Astronaut in the air"
                    width={584}
                    height={500}
                />
            </div>
            <div className="p-10" >
                <h1
                    className="text-2xl lg:text-5xl xl:text-5xl font-bold lg:tracking-tight xl:tracking-tighter">
                    We connect<br />
                    Tech Employees<br />
                    Serving Notice or Affected by Layoffs- <br />
                    To leading brands & startups
                </h1>
                <p className="text-lg mt-4 text-slate-600 max-w-xl">
                    We help you boost visibility & secure 5X more interviews through our specialised recruitment tools and services.
                    Kick start your expedition today
                </p>
                <div className="mt-6 flex flex-row gap-3">
                    <Signdialog />
                    <Registerdialog />
                </div>
            </div>
        </main>
    )
}
const reviews = [
    {
        name: "Jack",
        username: "@jack",
        body: "I've never seen anything like this before. It's amazing. I love it.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Jill",
        username: "@jill",
        body: "I don't know what to say. I'm speechless. This is amazing.",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "John",
        username: "@john",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Jane",
        username: "@jane",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Jenny",
        username: "@jenny",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "James",
        username: "@james",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/james",
    },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full" width="32" height="32" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{body}</blockquote>
        </figure>
    );
};

export default Banner;
