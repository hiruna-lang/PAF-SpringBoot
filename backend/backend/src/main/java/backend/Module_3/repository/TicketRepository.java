package backend.Module_3.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.Module_3.entity.Ticket;
import backend.Module_3.enums.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    List<Ticket> findAllByRequesterIdOrderByCreatedAtDesc(String requesterId);
    List<Ticket> findAllByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId);
    long countByAssignedTechnicianIdAndStatusIn(String technicianId, List<TicketStatus> statuses);
}
