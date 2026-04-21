package backend.Module_3.dto;

public record TechnicianResponse(
        String id,
        String name,
        String specialization,
        String phone,
        String email,
        long activeJobs) {
}
