import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import './LoginPage.css';

const LoginPage = () => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      window.location.replace("/chat");
    } catch (error) {
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <div className="login-container bg-gray-900">
      {/* //   <h1 className="text-[3rem] ">Login Page</h1> */}
      {/* //   <button className="google-signin-button" onClick={handleSignIn}>Sign in with Google</button> */}
      <div className="animate-slidein">
        <div className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Your Opinion Matters
        </div>
      </div>

      <h1 className="animate-slidein mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
        Share Your Thoughts with the World
      </h1>

      <p className="animate-slidein mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
        Let your voice be heard! Join our community and express your opinions on various topics. Whether it's about technology, culture, or anything in between, we value what you have to say.
      </p>

      <div className="animate-slidein">
        <button onClick={handleSignIn} className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
