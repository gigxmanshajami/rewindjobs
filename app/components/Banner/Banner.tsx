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
    const slugs = [
        "msexcel",
        "javascript",
        "dart",
        "java",
        "react",
        "flutter",
        "android",
        "html5",
        "css3",
        "nodedotjs",
        "express",
        "nextdotjs",
        "prisma",
        "amazonaws",
        "postgresql",
        "firebase",
        "nginx",
        "vercel",
        "testinglibrary",
        "jest",
        "cypress",
        "docker",
        "git",
        "jira",
        "github",
        "gitlab",
        "visualstudiocode",
        "androidstudio",
        "sonarqube",
        "figma",
    ];
    return (
        // <main>
        //     <div classNameName="px-6 lg:px-8 h-screen">
        //         <div classNameName="mx-auto max-w-7xl pt-16 sm:pt-20 pb-20 banner-image">
        //             <div classNameName="text-center">
        //                 <h1 classNameName="text-4xl font-semibold text-navyblue sm:text-5xl  lg:text-5xl md:4px lh-96">
        //                     If you are a Tech Employee Serving Notice or Impacted by Layoff , <br/> this site is for <b>YOU</b>
        //                 </h1>
        //                 <p classNameName="mt-6 text-lg leading-8 text-bluegray">
        //                     Ehya is the Instagram analytics platform teams use to stay focused on the goals, track <br /> engagement for report your business .
        //                 </p>
        //             </div>


        //             <div classNameName="text-center mt-5">
        //                 <button type="button" classNameName='text-15px text-white font-medium bg-blue py-5 px-9 mt-2 leafbutton'>
        //                     See our portfolio
        //                 </button>
        //                 <button type="button" classNameName='text-15px ml-4 mt-2 text-blue transition duration-150 ease-in-out hover:text-white hover:bg-blue font-medium py-5 px-16 border border-lightgrey leafbutton'>
        //                     More info
        //                 </button>

        //             </div>

        //             {/* <Image src={'/assets/banner/dashboard.svg'} alt="banner-image" width={1200} height={598} /> */}
        //         </div>
        //     </div>
        // </main>
        <main
            className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24 lg:p-10">
            <div className="md:order-1  h-auto  relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg">
                <Image
                    src={'/assets/hero.png'}
                    alt="Astronaut in the air"
                    width={584}
                    // style={{
                    //     height: "422px !important",
                    // }}
                    // className="animate-ping"
                    height={500}
                // sizes="(max-width: 800px) 100vw, 620px"
                // loading="eager"
                // format="avif"
                />
                {/* <div className="relative flex size-full top-[-67px] max-w-lg pb-20 items-center justify-center overflow-hidden  ">
                    <IconCloud iconSlugs={slugs} />
                </div> */}
                {/* <Marquee pauseOnHover className="[--duration:20s]">
                    {firstRow.map((review) => (
                        <ReviewCard key={review.username} {...review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]">
                    {secondRow.map((review) => (
                        <ReviewCard key={review.username} {...review} />
                    ))}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div> */}
            </div>
            <div >
                <h1
                    className="text-5xl lg:text-5xl xl:text-5xl font-bold lg:tracking-tight xl:tracking-tighter">
                    We connect<br />
                    Tech Employees<br />
                    Serving Notice or Affected by Layoffs- <br />
                    To leading brands & startups
                </h1>
                <p className="text-lg mt-4 text-slate-600 max-w-xl">
                    We help you boost visibility & secure 5X more interviews through our specialised recruitment tools and services.
                    Kick start your expedition today
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">

                    <Signdialog />
                    <Registerdialog />



                </div>
                {/* <VelocityScroll
                    text="Velocity Scroll"
                    default_velocity={5}
                    className="font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]"
                /> */}
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
