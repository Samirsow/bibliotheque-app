package microservice.Bu.Emprunt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "microservice.Bu.Emprunt.Client") // ✅ plus explicite
public class EmpruntApplication {
	public static void main(String[] args) {
		SpringApplication.run(EmpruntApplication.class, args);
		System.out.println("========================================");
		System.out.println("API Emprunt démarré sur le port 8080");
		System.out.println("========================================");
	}
}