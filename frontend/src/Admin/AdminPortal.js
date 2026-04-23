import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, isAdmin } from "../M4/authService";

/**
 * AdminPortal — redirects to the unified admin dashboard in M4.
 * If not logged in → login. If logged in but not admin → home.
 */
export default function AdminPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/m4/login", { replace: true });
    } else if (!isAdmin()) {
      navigate("/", { replace: true });
    } else {
      navigate("/m4/admin", { replace: true });
    }
  }, [navigate]);

  return null;
}
