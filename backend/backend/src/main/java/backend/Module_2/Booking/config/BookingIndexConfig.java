package backend.Module_2.Booking.config;

import com.mongodb.MongoCommandException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexInfo;

import java.util.List;

@Configuration
public class BookingIndexConfig {

    private static final Logger log = LoggerFactory.getLogger(BookingIndexConfig.class);

    /**
     * Drops the stale unique index on "user.email" from the bookings collection.
     *
     * This index was created by an old schema where user info was stored as a
     * nested object { user: { email: ... } }. The current schema stores it as
     * a flat field "userEmail", so the old index causes E11000 duplicate key
     * errors whenever a second booking is created (both have user.email = null).
     */
    @Bean
    CommandLineRunner dropStaleBookingIndexes(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                List<IndexInfo> indexes = mongoTemplate
                        .indexOps("bookings")
                        .getIndexInfo();

                for (IndexInfo index : indexes) {
                    String name = index.getName();
                    // Drop any index that references the old nested "user.email" field
                    if (name != null && name.contains("user.email")) {
                        mongoTemplate.indexOps("bookings").dropIndex(name);
                        log.info("[M2] Dropped stale index '{}' from bookings collection.", name);
                    }
                }
            } catch (MongoCommandException e) {
                log.warn("[M2] Could not drop stale booking index (may not exist): {}", e.getMessage());
            } catch (Exception e) {
                log.warn("[M2] Unexpected error while cleaning booking indexes: {}", e.getMessage());
            }
        };
    }
}
