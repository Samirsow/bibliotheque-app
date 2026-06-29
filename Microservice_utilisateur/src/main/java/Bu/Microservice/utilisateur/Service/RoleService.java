// RoleService.java
package Bu.Microservice.utilisateur.Service;

import Bu.Microservice.utilisateur.Model.Role;
import Bu.Microservice.utilisateur.Repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public Role getOrCreateRole(String nom) {
        return roleRepository.findByNom(nom)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setNom(nom);
                    role.setDescription("Rôle: " + nom);
                    return roleRepository.save(role);
                });
    }
}