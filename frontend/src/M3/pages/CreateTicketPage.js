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

  // 🔥 Validation patterns
  const phoneRegex = /^[0-9]{10}$/;
  const textRegex = /^[a-zA-Z0-9 ]*$/;

  async function handleSubmit(payload) {

    // ❗ Phone validation
    if (!phoneRegex.test(payload.preferredContact)) {
      alert("Phone number must contain exactly 10 digits (numbers only)");
      return;
    }

    // ❗ Description validation
    if (!textRegex.test(payload.description)) {
      alert("Description cannot contain special characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTicket(payload);
      navigate(buildRolePath(role, `tickets/${created.id}`));
    } catch (error) {
      console.error(error);
      alert("Error creating ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <TicketForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      defaultContact={user?.phone}
    />
  );
}