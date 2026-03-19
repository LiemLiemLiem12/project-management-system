import ButtonSocial from "@/components/Button/ButtonSocial";
import TextInput from "@/components/Input/TextInput";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Popket - Login",
  },
};

export default function LoginPage() {
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
        />
        <TextInput
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          compulsory={true}
        />

        <div className="remember-me-group flex items-center gap-2 self-start">
          <input type="checkbox" id="rememberMe" className="mr-2" />
          <label htmlFor="rememberMe" className="text-sm font-bold">
            Remember me
          </label>
        </div>

        <a
          href=""
          className="w-full px-10 py-2 bg-primary hover:bg-primary-dark font-bold text-white text-center rounded-full"
        >
          Continue
        </a>

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
