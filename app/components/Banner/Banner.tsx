'use client'
import Image from "next/image";

import Link from 'next/link';
import Signdialog from "@/app/components/Navbar/Signdialog";
import Registerdialog from "@/app/components/Navbar/Registerdialog";
import IconCloud from "@/components/ui/icon-cloud";
import { VelocityScroll } from "@/components/ui/scroll-based-velocity";
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
            <div className="md:order-1 hidden md:block lg:h-96 h-full ">
                {/* <Image
                    src={'/assets/hero.png'}
                    alt="Astronaut in the air"
                    width={584}
                    style={{
                        height: "422px !important",
                    }}
                    // className="animate-ping"
                    height={422}
                // sizes="(max-width: 800px) 100vw, 620px"
                // loading="eager"
                // format="avif"
                /> */}
                <div className="relative flex size-full top-[-67px] max-w-lg pb-20 items-center justify-center overflow-hidden  ">
                    <IconCloud iconSlugs={slugs} />
                </div>
            </div>
            <div>
                <h1
                    className="text-5xl lg:text-6xl xl:text-5xl font-bold lg:tracking-tight xl:tracking-tighter">
                    Tech <br />
                    Employees <br />
                    Serving Notice or Affected by Layoffs- <br />
                    This Site is for You!
                </h1>
                <p className="text-lg mt-4 text-slate-600 max-w-xl">
                    We help you boost visibility and secure 5X more interviews through our specialized staffing channels. Start your journey to getting hired today!
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

export default Banner;
