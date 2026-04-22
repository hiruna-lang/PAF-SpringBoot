package backend.Module_2.Booking.repository;

import backend.Module_2.Booking.model.Resource;
import backend.Module_2.Booking.model.ResourceStatus;
import backend.Module_2.Booking.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByAvailable(boolean available);

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByAvailableAndType(boolean available, ResourceType type);

    // Search by name or location containing keyword (case-insensitive)
    @Query("SELECT r FROM Resource r WHERE " +
           "(:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "  OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:type IS NULL OR r.type = :type) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)")
    List<Resource> search(
        @Param("keyword") String keyword,
        @Param("type") ResourceType type,
        @Param("status") ResourceStatus status,
        @Param("minCapacity") Integer minCapacity
    );
}
