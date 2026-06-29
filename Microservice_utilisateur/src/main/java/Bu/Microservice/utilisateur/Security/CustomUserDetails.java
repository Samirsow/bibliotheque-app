// CustomUserDetails.java
package Bu.Microservice.utilisateur.Security;

import Bu.Microservice.utilisateur.Model.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String email;
    private String motDePasse;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean actif;

    public static CustomUserDetails fromUtilisateur(Utilisateur utilisateur) {
        return new CustomUserDetails(
                utilisateur.getId(),
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                utilisateur.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getNom()))
                        .collect(Collectors.toList()),
                utilisateur.getActif()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return actif;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return actif;
    }
}