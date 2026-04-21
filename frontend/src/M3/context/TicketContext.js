import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addComment,
  assignTechnician,
  createTicket,
  createTechnician,
  deleteComment,
  getTechnicians,
  getTickets,
  rejectTicket,
  updateComment,
  updateTicketStatus,
} from "../api/ticketService";
import { useAuth } from "./AuthContext";
import { useToasts } from "./ToastContext";

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const { auth, isAuthenticated } = useAuth();
  const { pushToast } = useToasts();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [lastError, setLastError] = useState("");

  const refreshAll = useCallback(async () => {
    if (!auth) {
      setTickets([]);
      setTechnicians([]);
      setLastError("");
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    try {
      const [ticketData, technicianData] = await Promise.all([getTickets(), getTechnicians()]);
      setTickets(ticketData);
      setTechnicians(technicianData);
      setLastError("");
    } catch (error) {
      setLastError(error.message);
      pushToast({
        title: "Backend connection failed",
        message: error.message,
        tone: "danger",
      });
    } finally {
      setIsBootstrapping(false);
    }
  }, [auth, pushToast]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setIsBootstrapping(false);
      setTickets([]);
      setTechnicians([]);
      setLastError("");
    }
  }, [isAuthenticated, refreshAll]);

  async function runAction(action, successToast) {
    try {
      const result = await action();
      if (successToast) {
        pushToast(successToast);
      }
      return result;
    } catch (error) {
      pushToast({
        title: "Request failed",
        message: error.message,
        tone: "danger",
      });
      throw error;
    }
  }

  async function handleCreateTicket(payload) {
    const created = await runAction(() => createTicket(payload), {
      title: "Ticket submitted",
      message: "The request was sent to the backend successfully.",
      tone: "success",
    });
    await refreshAll();
    return created;
  }

  async function handleCreateTechnician(payload) {
    const created = await runAction(() => createTechnician(payload), {
      title: "Technician added",
      message: "The new technician has been created successfully.",
      tone: "success",
    });
    await refreshAll();
    return created;
  }

  async function handleAssign(ticketId, technicianId) {
    await runAction(() => assignTechnician(ticketId, technicianId), {
      title: "Assignment updated",
      message: "Technician assignment saved.",
      tone: "success",
    });
    await refreshAll();
  }

  async function handleStatusUpdate(ticketId, status, options) {
    await runAction(() => updateTicketStatus(ticketId, status, options), {
      title: "Status updated",
      message: `Ticket moved to ${status}.`,
      tone: "success",
    });
    await refreshAll();
  }

  async function handleReject(ticketId, reason) {
    await runAction(() => rejectTicket(ticketId, reason), {
      title: "Ticket rejected",
      message: "The ticket was rejected with a reason.",
      tone: "info",
    });
    await refreshAll();
  }

  async function handleAddComment(ticketId, message) {
    await runAction(() => addComment(ticketId, message));
    await refreshAll();
  }

  async function handleEditComment(ticketId, commentId, message) {
    await runAction(() => updateComment(ticketId, commentId, message), {
      title: "Comment updated",
      message: "Your comment changes were saved.",
      tone: "success",
    });
    await refreshAll();
  }

  async function handleDeleteComment(ticketId, commentId) {
    await runAction(() => deleteComment(ticketId, commentId), {
      title: "Comment deleted",
      message: "The comment was removed from the thread.",
      tone: "info",
    });
    await refreshAll();
  }

  return (
    <TicketContext.Provider
      value={{
        tickets,
        technicians,
        isBootstrapping,
        lastError,
        refreshAll,
        createTicket: handleCreateTicket,
        createTechnician: handleCreateTechnician,
        assignTechnician: handleAssign,
        updateStatus: handleStatusUpdate,
        rejectTicket: handleReject,
        addComment: handleAddComment,
        editComment: handleEditComment,
        deleteComment: handleDeleteComment,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
