import React from 'react'
import { FaWandMagicSparkles } from "react-icons/fa6";

const Features = () => {
  return (
    <main id='features' className='font-ibm flex flex-col justify-center items-center w-full h-full'>
        <h1 className='text-6xl font-semibold text-milk text-center'>How it works</h1>
        <div className='mt-10 flex flex-row items-center justify-center gap-10 w-full'>
            <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-1/3 h-96'>
                <h2 className='pt-8 text-2xl text-milk font-medium '>OwlTrack is your AI guidance counselor. It</h2>
                <div className='flex flex-row space-x-2 items-center'>
                    <div className='flex flex-row items-center justify-center space-x-2 w-fit rounded-full bg-highlight text-owl text-2xl font-medium text-center px-4 mt-2 pb-1'>
                        <FaWandMagicSparkles />
                        <p className='font-bold'>creates</p>
                    </div>
                    <h2 className='text-2xl text-milk font-medium'>your four year plan</h2>
                </div>
            </div>

            <div className='flex flex-col items-center justify-center border border-outline rounded-lg bg-modal w-1/3 h-96'>

            </div>
        </div>
    </main>
  )
}

export default Features