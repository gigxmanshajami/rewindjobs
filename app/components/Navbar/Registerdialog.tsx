import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Register = () => {
    let [isOpen, setIsOpen] = useState(false)

    const closeModal = () => {
        setIsOpen(false)
    }

    const openModal = () => {
        setIsOpen(true)
    }

    return (
        <>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto  sm:pr-0">
                <div className='hidden lg:block'>
                    <Link href={`/registration`}>
                        <Button variant="outline" className='bg-black text-white shadow-none font-bold p-[22px] rounded-[50px]'>Register</Button>
                    </Link>
                </div>
            </div>

        </>
    )
}

export default Register;
