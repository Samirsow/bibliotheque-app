package Bu.micosevice.Livre.Mapper;

import Bu.micosevice.Livre.Dto.LivreReponseDTO;
import Bu.micosevice.Livre.Dto.LivreRequeteDTO;
import Bu.micosevice.Livre.Model.Livre;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T02:31:06+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.18 (Microsoft)"
)
@Component
public class LivreMapperImpl implements LivreMapper {

    @Override
    public Livre toEntity(LivreRequeteDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Livre livre = new Livre();

        livre.setTitre( dto.getTitre() );
        livre.setAuteur( dto.getAuteur() );
        livre.setIsbn( dto.getIsbn() );
        livre.setEditeur( dto.getEditeur() );
        livre.setAnneePublication( dto.getAnneePublication() );
        livre.setCategorie( dto.getCategorie() );
        livre.setDescription( dto.getDescription() );
        livre.setNombreExemplairesTotal( dto.getNombreExemplairesTotal() );

        return livre;
    }

    @Override
    public LivreReponseDTO toResponseDTO(Livre livre) {
        if ( livre == null ) {
            return null;
        }

        LivreReponseDTO livreReponseDTO = new LivreReponseDTO();

        livreReponseDTO.setId( livre.getId() );
        livreReponseDTO.setTitre( livre.getTitre() );
        livreReponseDTO.setAuteur( livre.getAuteur() );
        livreReponseDTO.setIsbn( livre.getIsbn() );
        livreReponseDTO.setAnneePublication( livre.getAnneePublication() );
        livreReponseDTO.setEditeur( livre.getEditeur() );
        livreReponseDTO.setCategorie( livre.getCategorie() );
        livreReponseDTO.setDescription( livre.getDescription() );
        livreReponseDTO.setNombreExemplairesTotal( livre.getNombreExemplairesTotal() );
        livreReponseDTO.setNombreExemplairesDisponibles( livre.getNombreExemplairesDisponibles() );
        livreReponseDTO.setStatut( livre.getStatut() );
        livreReponseDTO.setDateCreation( livre.getDateCreation() );

        return livreReponseDTO;
    }
}
