"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/AuthProvider";
import { TrashIcon } from "@/components/icons";

function DeleteAccountContent() {
  const router = useRouter();
  const { deleteAccount, deleteAccountLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState(null);

  const itemsDeleted = [
    "Your account and profile information",
    "All chat history and conversation sessions",
    "Saved preferences (language, book filter, theme)",
    "Daily streak data and spiritual journey tracking",
    "Any associated subscription and billing records",
  ];

  const handleDelete = async () => {
    setError(null);
    const { error: err } = await deleteAccount();
    if (err) {
      setError(err);
      setShowModal(false);
      setConfirmText("");
    } else {
      router.replace("/login");
    }
  };

  const isConfirmed = confirmText.trim().toUpperCase() === "DELETE";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Delete Account" showBackButton onBack={() => router.push("/settings")} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Warning banner */}
          <div className="flex flex-col items-center rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <TrashIcon className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Delete Your Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This action is permanent and cannot be undone.
            </p>
          </div>

          {/* What will be deleted */}
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What Will Be Deleted
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {itemsDeleted.map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <TrashIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning text */}
          <div className="mt-8 rounded-2xl border border-border glass p-6">
            <h3 className="text-sm font-semibold text-foreground">Before You Go</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Once you delete your account, all your data will be permanently removed from
              our servers. You will not be able to recover any of your chat history,
              preferences, or spiritual journey data. If you change your mind later, you
              will need to create a new account from scratch.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If you&apos;re experiencing any issues or have questions, consider reaching
              out to our support team at{" "}
              <a href="mailto:support@askmadha.com" className="font-medium text-primary underline">
                support@askmadha.com
              </a>{" "}
              before deleting your account.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Delete button */}
          <div className="mt-8">
            <button
              onClick={() => setShowModal(true)}
              disabled={deleteAccountLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
            >
              <TrashIcon className="h-5 w-5" />
              {deleteAccountLoading ? "Deleting..." : "Delete My Account"}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ask Madha v1.0.0
          </p>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowModal(false);
            setConfirmText("");
          }}
        >
          <div
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <TrashIcon className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Confirm Account Deletion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This will permanently delete your account and all associated data.
                This action <span className="font-semibold text-red-500">cannot be undone</span>.
              </p>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-foreground">
                Type <span className="font-bold text-red-500">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                }}
                disabled={deleteAccountLoading}
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || deleteAccountLoading}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleteAccountLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeleteAccountPage() {
  return (
    <AuthGuard>
      <DeleteAccountContent />
    </AuthGuard>
  );
}
