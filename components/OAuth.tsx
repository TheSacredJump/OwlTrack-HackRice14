'use client';

import React from 'react';
import Image from 'next/image';
import { useSignIn } from "@clerk/nextjs";
import CustomButton from "./CustomButton";

const OAuth = () => {
    const { isLoaded, signIn } = useSignIn();

    const handleGoogleSignIn = React.useCallback(async () => {
        if (!isLoaded) {
            return;
        }

        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/onboarding"
            });
        } catch (err) {
            console.error('OAuth error', err);
            alert('An error occurred during sign in. Please try again.');
        }
    }, [isLoaded, signIn]);

    return (
        <div>
            <div className="flex items-center mt-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-lg">Or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <CustomButton 
                title="Sign In With Google" 
                className="mt-5 w-full shadow-none" 
                IconLeft={
                    <Image 
                        src="/google.png"
                        width={20}
                        height={20}
                        alt="Google"
                        className="mx-2" 
                    />
                }
                bgVariant="outline"
                textVariant="milk"
                onClick={handleGoogleSignIn}
            />
        </div> 
    );
};

export default OAuth;