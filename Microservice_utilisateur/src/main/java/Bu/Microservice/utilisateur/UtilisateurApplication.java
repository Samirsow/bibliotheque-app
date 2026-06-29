package Bu.Microservice.utilisateur;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication

@EnableFeignClients(basePackages = "Bu.Microservice.utilisateur.Client")
public class UtilisateurApplication {

	public static void main(String[] args) {
		SpringApplication.run(UtilisateurApplication.class, args);

		System.out.println("========================================");
		System.out.println("Service des utilisateurs démarré sur le port 8082");
		System.out.println("========================================");
	}

}
