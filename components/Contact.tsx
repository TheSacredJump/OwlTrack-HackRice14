'use client';

import React, { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', { name, email, message });
    // Reset form fields
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <main id='contact' className='mt-10 font-ibm flex flex-col justify-center items-center w-full h-full mb-20'>
      <h1 className='text-6xl font-semibold text-milk text-center'>Contact Us</h1>
      <div className='mt-10 flex flex-col lg:flex-row items-start justify-center gap-10 w-[95%] '>
        <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-full lg:w-1/2 h-auto pb-5'>
          <h2 className='pt-8 text-2xl text-milk font-medium'>Get in touch</h2>
          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <div>
              <label htmlFor="name" className='text-milk'>Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full p-2 mt-1 bg-navy border border-outline rounded text-milk'
                required
              />
            </div>
            <div>
              <label htmlFor="email" className='text-milk'>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full p-2 mt-1 bg-navy border border-outline rounded text-milk'
                required
              />
            </div>
            <div>
              <label htmlFor="message" className='text-milk'>Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='w-full p-2 mt-1 bg-navy border border-outline rounded text-milk h-32'
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className='flex flex-row items-center justify-center space-x-2 w-full rounded-full bg-highlight text-owl text-xl font-medium text-center px-4 py-2 hover:bg-gradient-to-r hover:from-pink-500 hover:to-violet-500 hover:text-milk'
            >
              <IoSend />
              <span>Send Message</span>
            </button>
          </form>
        </div>

        <div className='px-4 flex flex-col border border-outline rounded-lg bg-modal w-full lg:w-1/3 h-auto'>
          <h2 className='pt-8 text-2xl text-milk font-medium'>Contact Information</h2>
          <div className='mt-6 space-y-4'>
            <div className='flex items-center space-x-3 text-milk'>
              <FaEnvelope className='text-xl text-owl' />
              <span>info@owltrack.com</span>
            </div>
            <div className='flex items-center space-x-3 text-milk'>
              <FaPhoneAlt className='text-xl text-owl' />
              <span>+1 (123) 456-7890</span>
            </div>
            <div className='flex items-center space-x-3 text-milk'>
              <FaMapMarkerAlt className='text-xl text-owl' />
              <span>123 Owl Street, Houston, TX 77005</span>
            </div>
          </div>
          <div className='mt-8 border-t border-outline pt-4 flex flex-row items-center gap-8 mb-5'>
            <h3 className='text-xl text-milk font-medium'>Follow Us</h3>
            <div className='flex space-x-4'>
              {/* Add your social media icons here */}
              {/* Example: */}
              <FaFacebook className='text-2xl text-owl hover:text-highlight cursor-pointer' />
              <FaTwitter className='text-2xl text-owl hover:text-highlight cursor-pointer' />
              <FaLinkedin className='text-2xl text-owl hover:text-highlight cursor-pointer' />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;