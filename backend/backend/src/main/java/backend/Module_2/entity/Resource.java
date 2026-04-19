package backend.Module_2.entity;

import backend.Module_2.enums.ResourceStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type;

    private Integer capacity;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status;
}