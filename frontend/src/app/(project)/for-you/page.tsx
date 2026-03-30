import RecentProject from "@/components/ForYou/RecentProject";

export default function ForYouPage() {
  return (
    <div className="size-full flex gap-3">
      <div className="flex-2/3 flex flex-col gap-3 px-10">
        <div className="flex flex-col mt-10">
          <h1 className="text-2xl font-bold">Good morning, Alex</h1>
          <p className="text-md">You have 3 new tasks today</p>
        </div>
        <RecentProject />
      </div>
      <div className="flex-1/3"></div>
    </div>
  );
}
