"use client";

import { useEffect, useState } from "react";
import { getInternalUserId } from "@/app/actions/users/user-actions";

export const TestUserId = () => {
  const [internalId, setInternalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternalId = async () => {
      try {
        const id = await getInternalUserId();
        setInternalId(id);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInternalId();
  }, []);

  if (loading) {
    return <div>Loading internal user ID...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      Internal User ID: {internalId !== null ? internalId : "Not found"}
    </div>
  );
};


