import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { MapPin, Phone, Mail } from 'lucide-react'; // Import necessary icons

// MIDDLE LINKS DATA
interface ProductType {
    id: number;
    link: string[];
}

const products: ProductType[] = [
    {
        id: 1,
        link: ['']
    },
    {
        id: 2,
        link: ['']
    }
]

const footer = () => {
    return (
        <div className="bg-[#f6f6f6] mt-0">
            <div className="mx-auto max-w-2xl pt-20 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="my-24 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">

                    {/* COLUMN-1 */}
                    <div className='col-span-4 md:col-span-12 lg:col-span-4 '>
                        <img src={'/assets/logo/logo.png'} alt="logo" className='pb-8' />
                        <div className='flex gap-4 ml-[15px]'>
                            <a href="https://facebook.com" className='footer-fb-icons' style={{
                                background: "black",
                            }} >
                                <Image src={'/assets/footer/facebook.svg'} alt="facebook" width={15} height={20} />
                            </a>
                            <a href="https://twitter.com" className='footer-icons' style={{
                                background: "black",
                            }}>
                                <Image src={'/assets/footer/twitter.svg'} alt="twitter" width={20} height={20} />
                            </a>
                            <a href="https://instagram.com" className='footer-icons' style={{
                                background: "black",
                            }}>
                                <Image src={'/assets/footer/instagram.svg'} alt="instagram" width={20} height={20} />
                            </a>
                        </div>
                    </div>
                    {/* CLOUMN-2/3 */}

                    {products.map((product) => (
                        <div key={product.id} className="group relative col-span-2 md:col-span-4 lg:col-span-2">
                            <ul>
                                {product.link.map((link: string, index: number) => (
                                    <li key={index} className='mb-5'>
                                        <Link href="/" className="text-black text-sm font-normal mb-6 space-links">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* CLOUMN-4 */}

                    <div className='col-span-4 md:col-span-4 lg:col-span-4'>
                        <div className="flex gap-2 ">
                            <MapPin className="text-black" size={24} /> {/* Location Icon */}
                            <h5 className="text-base font-normal text-black">Sector 62 Noida, U.P, India 201309</h5>
                        </div>
                        <div className="flex gap-2 mt-10">
                            <Phone className="text-black" size={24} /> {/* Phone Icon */}
                            <h5 className="text-base font-normal text-black">+91-120-4542476</h5>
                        </div>
                        <div className="flex gap-2 mt-10">
                            <Mail className="text-black" size={24} /> {/* Email Icon */}
                            <h5 className="text-base font-normal text-black">contact@rewindjobs.com</h5>
                        </div>
                    </div>
                </div>

                {/* All Rights Reserved */}

                <div className='py-10 lg:flex flex-col justify-between border-t border-t-bordertop pb-4'>
                    <div className="flex justify-between">
                        <h4 className='text-black text-sm text-center lg:text-start font-normal'>@2024 All Rights Reserved By RewindJobs</h4>
                        <div className="flex gap-5 mt-5 lg:mt-0 justify-center lg:justify-start">
                            <h4 className='text-black text-sm font-normal'><Link href="/privacypolicy/page.txt" target="_blank">Privacy policy</Link></h4>
                            <div className="h-5 bg-bordertop w-0.5"></div>
                            <h4 className='text-black text-sm font-normal'><Link href="/termsconditions/page.txt" target="_blank">Terms & conditions</Link></h4>

                        </div>
                    </div>
                    <div className="pt-4 pb-1">
                        <Link href="https://manshajami.xyz/" target="_blank"><span className="text-sm flex items-center justify-center font-normal text-black float-right"> Developed With <Heart className="ml-1 mr-1 animate-pulse" size={17} color="red" fill="red" /> <span className="underline">Mansha Jami</span> </span></Link>
                    </div>
                </div>

            </div>

        </div >
    )
}

export default footer;