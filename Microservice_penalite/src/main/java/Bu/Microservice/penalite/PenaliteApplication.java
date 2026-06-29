package Bu.Microservice.penalite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "Bu.Microservice.penalite.Clients")
@SpringBootApplication
public class PenaliteApplication {

	public static void main(String[] args) {
		SpringApplication.run(PenaliteApplication.class, args);
		System.out.println("========================================");
		System.out.println("Service des pénalités démarré sur le port 8085");
		System.out.println("Tarif par jour: 0.50 | Plafond max: 20.00");
		System.out.println("========================================");
	}

}
