'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const Navbar = () => {
    const [hasScrolled, setHasScrolled] = useState(false)
    const { user, isSignedIn } = useUser();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setHasScrolled(true)
            } else {
                setHasScrolled(false)
            }
        };

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])
    

  return (
    <nav className={`font-ibm fixed top-0 w-full h-14 z-50 bg-navy ${hasScrolled ? 'shadow' : 'bg-transparent'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-14'>
          <div className='flex flex-row space-x-5 items-center'>
            <Link href='/' className='flex flex-row items-center space-x-2 mr-5'>
                <Image src={'/owltrack_logo.png'} alt='logo' width={50} height={50} className='w-8 h-8' />
                <h1 className='text-milk text-2xl hidden md:flex'>OwlTrack</h1>
            </Link>
            <Link href='/#features' className='hidden lg:flex'>
              <h1 className='text-subtext hover:scale-105 hover:bg-gray-200 rounded px-2 transition duration-300 hover:text-owl'>Features</h1>
            </Link>
            <Link href='/#faqs' className='hidden lg:flex'>
              <h1 className='text-subtext hover:scale-105 hover:bg-gray-200 rounded px-2 transition duration-300 hover:text-owl'>FAQs</h1>
            </Link>
            <Link href='/#contact' className='hidden lg:flex'>
              <h1 className='text-subtext hover:scale-105 hover:bg-gray-200 rounded px-2 transition duration-300 hover:text-owl'>Contact</h1>
            </Link>
          </div>
          <div className='hidden lg:flex space-x-4 font-ibm items-center'>
            <Link href={`${isSignedIn ? '/dashboard' : '/sign-in'}`}>
                <div className="bg-button px-3 py-1 rounded text-milk font-medium hover:scale-105 hover:bg-owl hover:text-milk transition duration-300 tracking-tight" >
                {<SignedIn>Dashboard</SignedIn>}  {<SignedOut>Sign Up / Login</SignedOut>}
                </div>
            </Link>
            <SignedIn>
                <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar