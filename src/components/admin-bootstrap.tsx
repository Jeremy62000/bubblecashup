import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * The very first account that connects becomes the app admin. Runs once per
 * session, right after authentication.
 */
export function AdminBootstrap() {
  const { isAuthenticated, isLoading } = useAuth();
  const claimAdmin = useMutation(api.admin.maybeClaimAdmin);
  const done = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !done.current) {
      done.current = true;
      claimAdmin().catch(() => {
        /* offline / unauthenticated — retry next session */
      });
    }
  }, [isAuthenticated, isLoading, claimAdmin]);

  return null;
}