package backend.Module_3.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.Module_3.dto.TechnicianResponse;
import backend.Module_3.service.TechnicianService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/module3/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping
    public List<TechnicianResponse> getTechnicians() {
        return technicianService.getTechnicians();
    }

    @org.springframework.web.bind.annotation.PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public TechnicianResponse createTechnician(@Valid @org.springframework.web.bind.annotation.RequestBody backend.Module_3.dto.TechnicianRequest request) {
        return technicianService.createTechnician(request);
    }
}
