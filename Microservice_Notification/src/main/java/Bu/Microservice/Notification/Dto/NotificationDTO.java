package Bu.Microservice.Notification.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long utilisateurId;
    private String utilisateurEmail;
    private String type;
    private String sujet;
    private String message;
}