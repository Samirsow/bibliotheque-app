
package microservice.Bu.Emprunt.exception;

public class UtilisateurNonAutoriseException extends RuntimeException {
    public UtilisateurNonAutoriseException(String message) {
        super(message);
    }
}