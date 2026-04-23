package backend.Module_4.Auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stores the last-used sequence number for each role prefix.
 * One document per role: id = "USR", "ADM", "TCN"
 */
@Document(collection = "id_counters")
public class Counter {

    @Id
    private String id;   // e.g. "USR", "ADM", "TCN"

    private long seq;    // last used number

    public Counter() {}

    public Counter(String id, long seq) {
        this.id  = id;
        this.seq = seq;
    }

    public String getId()       { return id; }
    public void   setId(String id) { this.id = id; }

    public long   getSeq()      { return seq; }
    public void   setSeq(long seq) { this.seq = seq; }
}
