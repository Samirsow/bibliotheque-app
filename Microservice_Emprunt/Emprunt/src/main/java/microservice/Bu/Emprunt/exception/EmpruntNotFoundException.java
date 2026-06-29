
package microservice.Bu.Emprunt.exception;

public class EmpruntNotFoundException extends RuntimeException {
    public EmpruntNotFoundException(String message) {
        super(message);
    }
}