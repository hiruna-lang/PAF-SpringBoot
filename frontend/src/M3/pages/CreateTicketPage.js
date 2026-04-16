import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketForm from "../components/TicketForm";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../context/TicketContext";
import { buildRolePath } from "../routes";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { createTicket } = useTickets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setIsSubmitting(true);
    try {
      const created = await createTicket(payload);
      navigate(buildRolePath(role, `tickets/${created.id}`));
    } finally {
      setIsSubmitting(false);
    }
  }

  return <TicketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} defaultContact={user?.phone} />;
}
