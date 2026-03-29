import { user } from "@/store/Store";

export default function WelcomeHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Welcome back, {user.name}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        You have{" "}
        <span className="font-semibold text-gray-700">
          {user.taskCount} tasks
        </span>{" "}
        to complete today across{" "}
        <span className="font-semibold text-gray-700">
          {user.projectCount} projects
        </span>
        .
      </p>
    </div>
  );
}
