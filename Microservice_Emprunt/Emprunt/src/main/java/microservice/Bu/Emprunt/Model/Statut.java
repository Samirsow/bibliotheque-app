package microservice.Bu.Emprunt.Model;

public enum Statut {
    EN_ATTENTE,    // En attente de validation par le bibliothécaire
    EN_COURS,      // Validé et en cours
    RETOURNE,      // Retourné
    REFUSE,        // Refusé par le bibliothécaire
    ANNULE,
    EN_RETARD
}