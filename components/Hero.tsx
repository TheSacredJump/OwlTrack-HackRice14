"use client"

import React from 'react'
import { motion } from "framer-motion";
import { LampContainer } from "../components/ui/lamp";

const Hero = () => {
  return (
    <div className='flex justify-center items-center w-full h-full md:h-screen font-ibm'>
      <LampContainer>
        <div className='flex flex-col gap-8 mx-auto'>
            <motion.h1 
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }} 
              className='text-center text-7xl text-milk font-semibold'
            >
              The AI-Powered Course <br /> Planner for&nbsp;
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-owl to-emerald-500'>Students.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className='text-center text-subtext font-medium text-lg'
            >
              OwlTrack builds your four-year plan, suggests courses, and provides 
              <br /> data-driven course analytics to ensure your future success.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              onClick={() => {}} 
              className='mt-10 bg-owl w-64 mx-auto shadow-md shadow-owl hover:shadow-milk px-5 py-3 rounded-lg text-milk text-medium text-xl hover:scale-105 hover:bg-milk hover:text-owl transition duration-500'
            >
              Get Started
            </motion.button>
        </div>
      </LampContainer>
    </div>
  )
}

export default Hero