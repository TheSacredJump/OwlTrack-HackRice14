'use client';

import React, { useState } from 'react';
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
    });

    const [verification, setVerification] = useState({
        state: 'default',
        error: '',
        code: ''
    });

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        try {
            await signUp.create({
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                emailAddress: form.email,
                password: form.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setVerification({
                ...verification,
                state: 'pending'
            });
        } catch (err) {
            alert(err.errors[0].longMessage);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            });

            if (completeSignUp.status === 'complete') {
                // Replace with your API call if needed
                await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: form.firstName,
                        lastName: form.lastName,
                        username: form.username,
                        email: form.email,
                        clerkId: completeSignUp.createdUserId,
                    })
                });
                
                await setActive({ session: completeSignUp.createdSessionId });
                setShowSuccessModal(true);
            } else {
                setVerification({
                    ...verification,
                    state: 'failed',
                    error: 'Verification failed.'
                });
            }
        } catch (err) {
            setVerification({
                ...verification,
                state: 'failed',
                error: err.errors[0].longMessage
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-navy">
            {/* Left side - Image */}
            <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{backgroundImage: "url('/riceuni_wallpaper.jpeg')"}}>
                <div className="w-full h-full bg-gradient-to-r from-navy/80 to-transparent flex items-center justify-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl font-bold text-milk text-center px-10"
                    >
                        Your Journey at OwlTrack Starts Here
                    </motion.h1>
                </div>
            </div>

            {/* Right side - Sign Up Form */}
            <div className="w-full lg:w-1/2 px-8 py-12 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto"
                >
                    <Image 
                        src="/owltrack_logo.png"
                        width={80}
                        height={80}
                        alt="OwlTrack Logo"
                        className="mb-8 mx-auto"
                    />
                    <h2 className="text-3xl font-bold text-milk mb-8 text-center">Create Your Account</h2>
                    
                    <InputField 
                        label="First Name"
                        placeholder="Enter your first name"
                        icon="/person.png"
                        value={form.firstName}
                        onChange={(e) => setForm({...form, firstName: e.target.value})}
                    />
                    <InputField 
                        label="Last Name"
                        placeholder="Enter your last name"
                        icon="/person.png"
                        value={form.lastName}
                        onChange={(e) => setForm({...form, lastName: e.target.value})}
                    />
                    <InputField 
                        label="Username"
                        placeholder="Choose a username"
                        icon="/person.png"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                    />
                    <InputField 
                        label="Email"
                        placeholder="Enter your Rice email"
                        icon="/email.png"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                    <InputField 
                        label="Password"
                        placeholder="Enter your password"
                        icon="/lock.png"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                    />

                    <CustomButton 
                        title="Sign Up" 
                        onClick={onSignUpPress} 
                        className="mt-6 w-full"
                    />

                    <OAuth />

                    <p className="text-sm text-center text-subtext mt-8">
                        Already have an account? 
                        <Link href="/sign-in">
                            <span className="text-primary-500 hover:underline"> Log In</span>
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Modals */}
            {verification.state === 'pending' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                >
                    <div className="bg-navy p-8 rounded-2xl max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Verification</h2>
                        <p className="mb-6">
                            We've sent a verification code to {form.email}
                        </p>
                        <InputField 
                            label="Code"
                            icon="/lock.png"
                            placeholder="12345"
                            value={verification.code}
                            onChange={(e) => setVerification({...verification, code: e.target.value})}
                        />

                        {verification.error && (
                            <p className="text-red-500 text-sm mt-2 mb-4">
                                {verification.error}
                            </p>
                        )}

                        <CustomButton 
                            title="Verify Email" 
                            onClick={onPressVerify} 
                            className="mt-6 w-full"
                        />
                    </div>
                </motion.div>
            )}

            {showSuccessModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                >
                    <div className="bg-navy p-8 rounded-2xl max-w-md w-full text-center">
                        <Image 
                            src="/check.png"
                            width={80}
                            height={80}
                            alt="Success"
                            className="mx-auto mb-6"
                        />
                        <h2 className="text-3xl font-bold mb-4">Verified</h2>
                        <p className="text-gray-600 mb-8">
                            You have successfully verified your account.
                        </p>
                        <CustomButton 
                            title="Let's Get Started" 
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.push('/onboarding');
                            }}
                            className="w-full"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default SignUp;