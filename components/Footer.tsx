import React from 'react';
import Image from 'next/image';
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className='font-ibm w-full bg-navy py-8'>
      <div className='container mx-auto flex flex-col lg:flex-row justify-between items-center px-4'>
        {/* Left: Logo and Description */}
        <div className='flex flex-col lg:flex-row items-center'>
          <Image src={'/owltrack_logo.png'} alt='logo' width={50} height={50} className='w-12 h-12' />
          <p className='text-milk text-center text-2xl lg:text-left lg:ml-4 mt-4 lg:mt-0'>
            OwlTrack
          </p>
        </div>

        {/* Middle: Quick Links */}
        <div className='flex flex-col text-center mt-6 lg:mt-0'>
          <ul className='flex space-x-6 text-milk'>
            <li><a href="#features" className='hover:text-highlight'>Features</a></li>
            <li><a href="#faqs" className='hover:text-highlight'>FAQ</a></li>
            <li><a href="#contact" className='hover:text-highlight'>Contact Us</a></li>
          </ul>
        </div>

        {/* Right: Social Media Icons */}
        <div className='flex space-x-6 mt-6 lg:mt-0'>
          <a href="https://twitter.com" className='text-milk hover:text-highlight'>
            <FaTwitter className='w-6 h-6' />
          </a>
          <a href="https://instagram.com" className='text-milk hover:text-highlight'>
            <FaInstagram className='w-6 h-6' />
          </a>
          <a href="https://github.com" className='text-milk hover:text-highlight'>
            <FaGithub className='w-6 h-6' />
          </a>
          <a href="https://linkedin.com" className='text-milk hover:text-highlight'>
            <FaLinkedin className='w-6 h-6' />
          </a>
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className='text-milk text-center mt-6'>
        <p>&copy; {new Date().getFullYear()} OwlTrack. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer;
