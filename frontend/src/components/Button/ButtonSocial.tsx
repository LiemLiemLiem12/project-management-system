import Image from "next/image";

type ButtonSocialProps = {
  platform: string;
  src: string;
  alt: string;
  href: string;
};

export default function ButtonSocial(props: ButtonSocialProps) {
  return (
    <a
      href={props.href}
      className="w-full px-10 py-2 flex items-center justify-center border border-gray-300 hover:bg-gray-200 text-black text-center rounded-full"
    >
      <Image
        src={props.src}
        alt={props.alt}
        width={20}
        height={20}
        className="inline-block mr-2"
      />
      {props.platform}
    </a>
  );
}
