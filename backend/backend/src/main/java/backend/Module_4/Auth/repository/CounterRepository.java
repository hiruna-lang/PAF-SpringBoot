package backend.Module_4.Auth.repository;

import backend.Module_4.Auth.model.Counter;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CounterRepository extends MongoRepository<Counter, String> {
}
