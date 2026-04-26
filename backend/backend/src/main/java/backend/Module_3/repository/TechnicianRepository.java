package backend.Module_3.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.Module_3.entity.Technician;

public interface TechnicianRepository extends MongoRepository<Technician, String> {
}
