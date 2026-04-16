package backend.Module_3.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.Module_3.dto.TechnicianResponse;
import backend.Module_3.entity.Technician;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.exception.ResourceNotFoundException;
import backend.Module_3.repository.TechnicianRepository;
import backend.Module_3.repository.TicketRepository;
import backend.Module_3.service.TechnicianService;

@Service
@Transactional(readOnly = true)
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final TicketRepository ticketRepository;

    public TechnicianServiceImpl(TechnicianRepository technicianRepository, TicketRepository ticketRepository) {
        this.technicianRepository = technicianRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public List<TechnicianResponse> getTechnicians() {
        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED);
        return technicianRepository.findAll().stream()
                .filter(Technician::isActive)
                .map(technician -> new TechnicianResponse(
                        technician.getId(),
                        technician.getName(),
                        technician.getSpecialization(),
                        technician.getPhone(),
                        technician.getEmail(),
                        ticketRepository.countByAssignedTechnicianIdAndStatusIn(technician.getId(), activeStatuses)))
                .toList();
    }

    @Override
    public Technician getActiveTechnician(String technicianId) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        if (!technician.isActive()) {
            throw new ResourceNotFoundException("Technician is not active");
        }
        return technician;
    }

    @Override
    @Transactional
    public TechnicianResponse createTechnician(backend.Module_3.dto.TechnicianRequest request) {
        Technician technician = new Technician();
        technician.setId("tech-" + UUID.randomUUID().toString().substring(0, 8));
        technician.setName(normalize(request.getName()));
        technician.setSpecialization(normalize(request.getSpecialization()));
        technician.setPhone(normalize(request.getPhone()));
        technician.setEmail(normalize(request.getEmail()));
        technician.setPassword(normalize(request.getPassword()));
        technician.setActive(true);

        Technician saved = technicianRepository.save(technician);
        return new TechnicianResponse(
                saved.getId(),
                saved.getName(),
                saved.getSpecialization(),
                saved.getPhone(),
                saved.getEmail(),
                0L
        );
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
