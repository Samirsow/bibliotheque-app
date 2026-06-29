// Role.java
package Bu.Microservice.utilisateur.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String nom;  // ROLE_ADMIN, ROLE_BIBLIOTHECAIRE, ROLE_MEMBRE

    private String description;

    public Role(String nom, String description) {
        this.nom = nom;
        this.description = description;
    }
}