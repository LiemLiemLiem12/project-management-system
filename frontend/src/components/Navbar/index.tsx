import Image from "next/image";

export default function Navbar() {
  return (
    <>
      <div className="navbar-container px-2 sm:px-10 py-3 flex items-center justify-between">
        <a href="/" className="logo-group flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Picture of the author"
            width={50}
            height={50}
          />
          <span className="text-2xl hidden sm:block font-black">Popket</span>
        </a>

        <div className="cta-group flex font-bold items-center gap-4">
          <a
            href="/login"
            className="hover:bg-gray-200 px-4 py-2 rounded-lg w-fit"
          >
            <span>Login</span>
          </a>
          <a
            href="/sign-up"
            className="bg-primary hover:bg-primary-dark font-bold text-white px-4 py-2 rounded-lg"
          >
            <span>Get Started</span>
          </a>
        </div>
      </div>
    </>
  );
}
