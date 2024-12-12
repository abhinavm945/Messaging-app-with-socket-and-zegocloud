// src/components/Login.jsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

const Login = () => {
  const router = useRouter();
  const { state, dispatch } = useStateProvider();
  const { userInfo, newUser } = state; // Destructure the returned object directly

  useEffect(() => {
    if (userInfo?.id && !newUser) router.push("/"), [userInfo, newUser];
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();

    const {
      user: { displayName: name, email: userEmail, photoURL: profileImage },
    } = await signInWithPopup(firebaseAuth, provider);

    try {
      if (userEmail) {
        const { data } = await axios.post(CHECK_USER_ROUTE, {
          email: userEmail,
        });
        console.log({ data });
        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email: userEmail,
              profileImage,
              status: "",
            },
          });
          router.push("/onboarding");
        } else {
          const {
            id,
            name,
            email,
            profilePicture: profileImage,
            status,
          } = data.data;
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id,
              name,
              email,
              profileImage,
              status,
            },
          });
          router.push("/");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/whatsapp.gif"
          alt="whatsapp"
          height={325}
          width={325}
          priority
        />
        <span className="text-7xl gap-2">WHATSAPP</span>
      </div>
      <button
        className="flex justify-center items-center gap-7 bg-search-input-container-background p-4 rounded-lg mt-10"
        onClick={handleLogin}
      >
        <FcGoogle className="text-4xl" />
        <span className="text-white text-2xl">LOGIN WITH GOOGLE</span>
      </button>
    </div>
  );
};

export default Login;
