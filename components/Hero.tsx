import React from 'react'

const Hero = () => {
  return (
    <div className='flex justify-center items-center w-full h-full md:h-screen font-ibm'>
        <div className='flex flex-col gap-8 mx-auto'>
            <h1 className='text-center text-7xl text-milk font-semibold'>The AI-Powered Course <br /> Planner for&nbsp;
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-owl to-emerald-500'>Students.</span>
            </h1>
            <p className='text-center text-subtext font-medium text-lg'>OwlTrack builds your four-year plan, suggests courses, and provides <br /> data-driven course analytics to ensure your future success.</p>
            <button className='mt-10 bg-owl w-64 mx-auto shadow-md shadow-owl hover:shadow-milk px-5 py-3 rounded-lg text-milk text-medium text-xl hover:scale-105 hover:bg-milk hover:text-owl transition duration-500'>
              Get Started
            </button>
        </div>
    </div>
  )
}

export default Hero