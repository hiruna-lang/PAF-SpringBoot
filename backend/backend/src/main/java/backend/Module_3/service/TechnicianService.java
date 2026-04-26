package backend.Module_3.service;

import java.util.List;

import backend.Module_3.dto.TechnicianResponse;
import backend.Module_3.entity.Technician;

public interface TechnicianService {
    List<TechnicianResponse> getTechnicians();
    Technician getActiveTechnician(String technicianId);
    TechnicianResponse createTechnician(backend.Module_3.dto.TechnicianRequest request);
}
