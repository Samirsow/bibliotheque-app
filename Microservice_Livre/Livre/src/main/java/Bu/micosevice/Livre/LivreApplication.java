package Bu.micosevice.Livre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LivreApplication {

	public static void main(String[] args) {
		SpringApplication.run(LivreApplication.class, args);
		System.out.println("========================================");
		System.out.println("API livre démarré sur le port 8081");
		System.out.println("========================================");
	}

}
