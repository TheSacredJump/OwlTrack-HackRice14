import { SignIn } from "@clerk/nextjs";

import React from 'react'

const Auth = () => {
  return (
    <main className='h-screen flex flex-row items-center justify-center'>
      {/* SignIn section */}
        <SignIn />
    </main>
  )
}

export default Auth