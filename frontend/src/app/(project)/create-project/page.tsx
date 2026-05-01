"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  X,
  Plus,
  UserPlus,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Đảm bảo đường dẫn import đúng với thư mục của ông
import { useProjectService } from "@/services/project.service";
import { useAuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type Member = {
  id: string;
  email: string;
  role: "Viewer" | "Member" | "Moderator";
};

export default function CreateProjectPage() {
  const router = useRouter();

  const { createProject, isCreating } = useProjectService();
  const { checkUserExists, isCheckingEmail } = useAuthService();

  const currentUser = useAuthStore((state: any) => state.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [members, setMembers] = useState<Member[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<Member["role"]>("Member");

  const addMember = async () => {
    const email = emailInput.trim();
    if (!email) return;

    if (currentUser?.email && email === currentUser.email) {
      toast.error("You cannot add yourself to the project!");
      return;
    }

    if (members.find((m) => m.email === email)) {
      toast.error("This email is already in the list!");
      return;
    }

    try {
      const response = await checkUserExists(email);

      const exists = response.data?.exists;
      const fetchedUserId = response.data?.id;

      if (exists && fetchedUserId) {
        setMembers([...members, { id: fetchedUserId, email, role: roleInput }]);
        setEmailInput("");
        toast.success(`Successfully added ${email}`);
      } else {
        toast.error("User not found in the system!");
      }
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error("User not found in the system!");
      } else {
        toast.error("System error while checking email!");
      }
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a project name!");
      return;
    }

    try {
      await createProject({
        name,
        description,
        members: members.map((m) => ({
          id: m.id,
          email: m.email,
          role: m.role,
        })),
      });

      toast.success("Project created successfully!");
      router.push("/for-you");
    } catch (error) {
      console.error(error);
      toast.error("Error creating project, please try again!");
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 flex items-center px-6 gap-4 shrink-0 bg-white">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-sm font-bold text-slate-800">
          Create new project
        </span>
      </header>

      {/* Main Form */}
      <main className="flex-1 overflow-y-auto px-6 py-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create a new project
            </h1>
            <p className="text-slate-500">
              Set up basic information and invite your team to the project.
            </p>
          </div>

          {/* Project Details Section */}
          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
              Project details
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Project name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Reservation Engine"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          {/* Invite Members Section */}
          <section className="flex flex-col gap-6">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" /> Add members
              </h2>
            </div>

            {/* Input Add Member */}
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                  disabled={isCheckingEmail}
                  placeholder="name@company.com"
                  className={inputClass}
                />
              </div>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as Member["role"])}
                disabled={isCheckingEmail}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="Viewer">Viewer</option>
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
              </select>
              <button
                onClick={addMember}
                disabled={!emailInput || isCheckingEmail}
                className="px-7 py-2 bg-blue-500 text-white font-medium rounded-[12px] hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 min-w-[90px] justify-center"
              >
                {isCheckingEmail ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={16} /> Add
                  </>
                )}
              </button>
            </div>

            {/* Members List */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Team members ({members.length})
              </h3>

              {members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">
                          {member.email}
                        </span>
                        <span className="text-[11px] uppercase font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <ShieldCheck size={12} /> {member.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(member.email)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-sm text-slate-500">
                    You are the only person in this project right now.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer / Actions */}
      <footer className="border-t border-slate-200 bg-white px-8 py-4 flex items-center justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isCreating || isCheckingEmail}
          className="px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]"
        >
          {isCreating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Create Project"
          )}
        </button>
      </footer>
    </div>
  );
}
