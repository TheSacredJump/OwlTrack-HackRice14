import Image from 'next/image';
import React from 'react'
import { FaWandMagicSparkles } from "react-icons/fa6";
import { IoSparklesSharp } from "react-icons/io5";
import { PiShootingStarFill } from "react-icons/pi";


const Features = () => {
  return (
    <main id='features' className='font-ibm flex flex-col justify-center items-center w-full h-full mb-20'>
        <h1 className='text-6xl font-semibold text-milk text-center'>How it works</h1>
        <div className='mt-10 flex flex-col lg:flex-row items-center justify-center gap-10 w-[95%]'>
            <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-1/3 h-96'>
                <h2 className='pt-8 text-2xl text-milk font-medium '>OwlTrack is your AI counselor. It</h2>
                <div className='flex flex-row space-x-2 items-center'>
                    <div className='flex flex-row items-center justify-center space-x-2 w-fit rounded-full bg-highlight text-owl text-2xl font-medium text-center px-4 mt-2 pb-1'>
                        <FaWandMagicSparkles />
                        <p className='font-bold'>creates</p>
                    </div>
                    <h2 className='text-2xl text-milk font-medium'>your four year plan</h2>
                </div>
                <div className='border-x border-t border-outline bg-navy mt-5 h-full rounded-t-lg'>
                    <Image src={'/owltrack_logo.png'} alt='logo' width={50} height={50} className='w-8 h-8' />
                </div>
            </div>

            <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-1/3 h-96'>
                <h2 className='pt-8 text-2xl text-milk font-medium '>When you need help, OwlTrack</h2>
                <div className='flex flex-row space-x-2 items-center'>
                    <div className='flex flex-row items-center justify-center space-x-2 w-fit rounded-full bg-highlight text-owl text-2xl font-medium text-center px-4 mt-2 pb-1'>
                        <IoSparklesSharp />
                        <p className='font-bold'>suggests</p>
                    </div>
                    <h2 className='text-2xl text-milk font-medium'>tailored classes</h2>
                </div>
                <div className='border-x border-t border-outline bg-navy mt-5 h-full rounded-t-lg'>
                    <Image src={'/owltrack_logo.png'} alt='logo' width={50} height={50} className='w-8 h-8' />
                </div>
            </div>

            <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-1/3 h-96'>
                <h2 className='pt-8 text-2xl text-milk font-medium '>With powerful analytics, OwlTrack</h2>
                <div className='flex flex-row space-x-2 items-center'>
                    <div className='flex flex-row items-center justify-center space-x-2 w-fit rounded-full bg-highlight text-owl text-2xl font-medium text-center px-4 mt-2 pb-1'>
                        <PiShootingStarFill />
                        <p className='font-bold'>visualizes</p>
                    </div>
                    <h2 className='text-2xl text-milk font-medium'>course statistics</h2>
                </div>
                <div className='border-x border-t border-outline bg-navy mt-5 h-full rounded-t-lg'>
                    <Image src={'/owltrack_logo.png'} alt='logo' width={50} height={50} className='w-8 h-8' />
                </div>
            </div>
        </div>
    </main>
  )
}

export default Features