// Start with client-side rendering
"use client";

// Import necessary hooks and components
import React, { useCallback, useState } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import logo from "../RIE_Logo.png";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Login: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // const router = useRouter()

  // const handleSignUp = async () => {
  //   await supabase.auth.signUp({
  //     email,
  //     password,
  //   })
  // }

  return (
      <main className={styles.main}>
        <div className={styles.container}>
          <Image width={250} height={250} src={logo} alt="Retention Insight Engine" />
          <h1 className={styles.title}>Please Log In</h1>
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <button>Log In</button>
          <button>Register</button>
        </div>
      </main>
  );
};

export default Login;
