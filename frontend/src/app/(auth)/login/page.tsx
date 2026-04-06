"use client";

import ButtonSocial from "@/components/Button/ButtonSocial";
import TextInput from "@/components/Input/TextInput";
import Image from "next/image";
import type { Metadata } from "next";
import { useContext, useState } from "react";
import { useAuthService } from "@/services/auth.service";
import { Loader } from "lucide-react";
import IconLoader from "@/components/IconLoader";
import { MyContext } from "@/contexts/MyContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loginStatus } = useAuthService();
  const { persist, setPersist } = useContext(MyContext);

  const handleLogin = async (email: string, password: string) => {
    if (loginStatus) return;

    await login({ email, password });
  };

  const handleCheckboxChange = () => {
    const newValue = !persist;
    setPersist(newValue);
    localStorage.setItem("persist", JSON.stringify(newValue));
  };

  return (
    <div className="h-screen flex items-center justify-center px-10">
      <div className="form-container flex flex-col items-center w-full md:w-150 gap-5 bg-white rounded-sm px-10 md:px-20 py-10 shadow-xl">
        <div className="logo-group flex items-center gap-2">
          <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
          <h1 className="text-2xl">Popket</h1>
        </div>

        <span className="font-bold">Login to continue</span>

        <TextInput
          id="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          compulsory={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          compulsory={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="remember-me-group flex items-center gap-2 self-start">
          <input
            type="checkbox"
            id="rememberMe"
            className="mr-2"
            checked={persist}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="rememberMe" className="text-sm font-bold">
            Remember me
          </label>
        </div>

        {loginStatus ? (
          <button
            disabled={true}
            className="w-full h-10 flex items-center justify-center bg-gray-400 font-bold text-white rounded-full cursor-not-allowed"
          >
            <IconLoader size={5} />
          </button>
        ) : (
          <button
            onClick={() => handleLogin(email, password)}
            className="w-full h-10 px-10 py-2 bg-primary hover:bg-primary-dark font-bold text-white text-center rounded-full"
          >
            Continue
          </button>
        )}

        <span>
          <p className="text-sm text-gray-500">Or login with</p>
        </span>

        <ButtonSocial
          platform="Facebook"
          alt="Facebook Image"
          src="/facebook-icon.png"
          href="/facebook"
        />
        <ButtonSocial
          platform="Google"
          alt="Google Image"
          src="/google-icon.png"
          href="/google"
        />

        <div className="other-option-group flex items-center justify-center gap-2">
          <a href="" className="underline text-primary">
            You can't login?
          </a>
          <span className="w-1 h-1 bg-black rounded-full"></span>
          <a href="" className="underline text-primary">
            Create account
          </a>
        </div>

        <span className="w-full border border-gray-300"></span>

        <div className="logo-group flex items-center gap-2 opacity-10">
          <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
          <h1 className="text-2xl">Popket</h1>
        </div>
      </div>
    </div>
  );
}
