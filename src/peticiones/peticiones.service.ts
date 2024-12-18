import { Injectable, NotFoundException } from '@nestjs/common';
import { PeticionesEntity } from './peticiones.entity';
import { DataSource } from 'typeorm';
import { PeticionesDto } from './dto/peticiones.dto';
import { UsuarioEntity } from 'src/usuario/usuario.entity';

@Injectable()
export class PeticionesService 
{
    private peticionRepository;
    private usuarioRepository;

    constructor(private dataSource: DataSource) 
    {
        this.peticionRepository = this.dataSource.getRepository(PeticionesEntity);
        this.usuarioRepository = this.dataSource.getRepository(UsuarioEntity);
    }

    //**************************************//
    async registrar (dto:PeticionesDto): Promise<any>
    {
        const peticion = this.peticionRepository.create(dto);
        await this.peticionRepository.save(peticion);
        return { message: `Peticion: ${peticion.nombre} enviada` };
    }

    //**************************************//
    async peticionesusuario(nomuser:string): Promise<any>
    {
        const usuario = await this.usuarioRepository.findOneBy({nombre:nomuser});
        if(!usuario)
            {
              throw new NotFoundException({message: 'Usuario no registrado'});
            }
        const peticiones = await this.peticionRepository.find( { where: { usuario : usuario } } );
        return peticiones;
    }

    //**************************************//
    async mostrarTodasLasPeticiones(): Promise<any>
    {
        const peticiones = await this.peticionRepository.find();
        return peticiones;
    }

    //**************************************//
    async verPeticionesPendientes(): Promise<any>
    {
        const peticiones = await this.peticionRepository.find( { where: { estado: 'pendiente' } } );
        return peticiones;
    }

    //**************************************//
    async cambiarEstadoPeticion(id_evento:number, estadoNuevo:string):Promise<any>
    {
        const peticion = await this.peticionRepository.findOneBy({id:id_evento});
        if (!peticion) 
        {
          throw new NotFoundException({ message: 'Evento no existente' });
        }
        
        // Validar el estado
        if (!['aprobado', 'rechazado'].includes(estadoNuevo)) 
        {
          throw new NotFoundException('Estado inválido');
        }
        // Actualizar el estado
        peticion.estado = estadoNuevo;
        await this.peticionRepository.save(peticion);

        return { message: `Peticion actualizada a ${estadoNuevo}`};
    }
}
