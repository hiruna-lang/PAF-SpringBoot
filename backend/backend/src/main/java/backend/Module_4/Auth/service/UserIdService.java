package backend.Module_4.Auth.service;

import backend.Module_4.Auth.model.Counter;
import backend.Module_4.Auth.model.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

/**
 * Generates role-prefixed, zero-padded sequential IDs.
 *
 *   USER       → USR-0001, USR-0002, …
 *   ADMIN      → ADM-0001, ADM-0002, …
 *   TECHNICIAN → TCN-0001, TCN-0002, …
 *
 * Uses MongoDB findAndModify for atomic increment — safe under concurrent requests.
 */
@Service
public class UserIdService {

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Returns the prefix string for a given role.
     */
    public static String prefixFor(Role role) {
        return switch (role) {
            case ADMIN      -> "ADM";
            case TECHNICIAN -> "TCN";
            default         -> "USR";
        };
    }

    /**
     * Atomically increments the counter for the given role prefix and
     * returns a formatted ID like "USR-0001".
     */
    public String nextId(Role role) {
        String prefix = prefixFor(role);

        Query  query  = new Query(Criteria.where("_id").is(prefix));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions opts = FindAndModifyOptions.options()
                .returnNew(true)
                .upsert(true);

        Counter counter = mongoTemplate.findAndModify(query, update, opts, Counter.class);
        long seq = (counter != null) ? counter.getSeq() : 1L;

        return String.format("%s-%04d", prefix, seq);
    }
}
