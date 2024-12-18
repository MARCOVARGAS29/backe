import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CalificacionEntity } from './calificacion.entity';
import { CalificacionDto } from './dto/calificacion.dto';
import { DataSource } from 'typeorm';
import { UsuarioEntity } from 'src/usuario/usuario.entity';
import { EventoEntity } from 'src/evento/evento.entity';
@Injectable()
export class CalificacionService
{

    private calificacionRepository;
    private usuarioRepository;
    private eventoRepository;

    constructor(private dataSource: DataSource) 
    {
        this.calificacionRepository = this.dataSource.getRepository(CalificacionEntity);
        this.usuarioRepository=this.dataSource.getRepository(UsuarioEntity);
        this.eventoRepository=this.dataSource.getRepository(EventoEntity);
    }

    async create(dto: CalificacionDto): Promise<any> 
    {  
        if (dto.calificacion < 1 || dto.calificacion > 5) 
        {
            throw new BadRequestException(`La calificación debe estar entre 1 y 5`);
        }        
        const calificacion =this.calificacionRepository.create(dto);
        await this.calificacionRepository.save(calificacion);
        return {message : `Calificacion para evento: ${calificacion.id_evento} registrada`};
    }

    async califs()
    {
        const calificaciones = await this.calificacionRepository.find();
        return calificaciones;
    }

    async califsevento(nomevento:string):Promise<any>
    {
        const evento = await this.eventoRepository.findOneBy ({nombre:nomevento});  
        if(!evento)
        {
           throw new BadRequestException(`El evento no existe`);
        }
        const calificaciones = await this.calificacionRepository.find({where:{id_evento:evento}});
        return calificaciones;
    }

    async califsusuario(nomusuario:string):Promise<any>
    {
        const usuario = await this.usuarioRepository.findOneBy ({nombre:nomusuario});
        if(!usuario)
        {
           throw new BadRequestException(`El usuario no existe`);
        }
        const calificaciones = await this.calificacionRepository.find({where:{id_usuario:usuario}});
        return calificaciones;
    }
}

