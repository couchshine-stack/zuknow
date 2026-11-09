"use client";

import { useFormStatus } from "react-dom";

export function PendingSubmit({
  idle,
  pending,
  className = "btn-primary",
}: {
  idle: string;
  pending: string;
  className?: string;
}) {
  const status = useFormStatus();
  return (
    <button type="submit" disabled={status.pending} className={`${className} disabled:opacity-50`}>
      {status.pending ? pending : idle}
    </button>
  );
}
