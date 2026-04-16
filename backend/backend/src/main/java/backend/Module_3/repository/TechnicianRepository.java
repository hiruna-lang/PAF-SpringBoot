package backend.Module_3.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.Module_3.entity.Technician;

public interface TechnicianRepository extends JpaRepository<Technician, String> {
}
