package backend.Module_1.repository;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import backend.Module_1.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByStatus(ResourceStatus status);
}