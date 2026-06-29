// LivreNotFoundException.java
package Bu.micosevice.Livre.Exceptions;

public class LivreNotFoundException extends RuntimeException {
    public LivreNotFoundException(String message) {
        super(message);
    }
}