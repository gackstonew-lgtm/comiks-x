"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  Mail,
  Loader2,
  Lock,
} from "lucide-react";
import { TeamWorkspace, TeamMember } from "@/types";

export default function TeamWorkspacePage() {
  const [team, setTeam] = useState<TeamWorkspace | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        setStatusMessage(`Invited ${data.member.name} (${data.member.email}) as ${data.member.role}.`);
      } else {
        alert(data.error || "Failed to invite member");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_role",
          memberId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this team member from the workspace?")) return;
    try {
      const res = await fetch(`/api/team?memberId=${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center p-12 text-[#888] text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand mr-2" />
        Loading team workspace...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <Users className="w-3.5 h-3.5" />
            Team Workspace & Access
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            {team.name}
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Collaborate with animators, script writers, and voice directors on shared comic series.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm self-start md:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite Collaborator
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Workspace Summary & Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Members List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            Workspace Members ({team.members.length})
          </h3>

          <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] text-[#888] border-b border-[#2e2e2e]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Member</th>
                  <th className="py-2.5 px-4 font-medium">Role</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {team.members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#ededed]">{member.name}</div>
                      <div className="text-[11px] text-[#888]">{member.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {member.role === "owner" ? (
                        <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand text-[10px] font-semibold uppercase">
                          Owner
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="bg-[#1c1c1c] border border-[#2e2e2e] text-[#ededed] rounded-[4px] px-2 py-1 text-xs focus:outline-none focus:border-brand capitalize"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-[#666] hover:text-red-400 transition-colors"
                          title="Remove from team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles & Permissions Reference (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            Role Permissions
          </h3>
          <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] p-4 text-xs space-y-3">
            <div>
              <div className="font-bold text-[#ededed] text-xs">Owner & Admin</div>
              <p className="text-[11px] text-[#888] mt-0.5">
                Full billing control, GPU quota management, member invitations, and provider key vault access.
              </p>
            </div>
            <div className="pt-2 border-t border-[#222]">
              <div className="font-bold text-[#ededed] text-xs">Editor</div>
              <p className="text-[11px] text-[#888] mt-0.5">
                Can write scripts, generate character turnaround sheets, trigger video clips, and export timeline episodes.
              </p>
            </div>
            <div className="pt-2 border-t border-[#222]">
              <div className="font-bold text-[#ededed] text-xs">Viewer</div>
              <p className="text-[11px] text-[#888] mt-0.5">
                Read-only preview rights for storyboards, completed renders, and production comments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2e2e2e] rounded-[10px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <h2 className="text-sm font-bold text-[#ededed] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand" />
                Invite Team Member
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[#666] hover:text-[#ededed] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Kiprono Mutai"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                >
                  <option value="editor">Editor (Can create, edit & render)</option>
                  <option value="admin">Admin (Can manage team & keys)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#222] text-[#ededed] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteName || !inviteEmail}
                  className="px-4 py-1.5 rounded-[6px] bg-brand text-[#09090b] font-semibold text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
