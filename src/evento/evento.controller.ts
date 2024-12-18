import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Patch, Post, Put, RequestTimeoutException} from '@nestjs/common';
import { EventoService } from './evento.service';
import { EventoDto } from './dto/evento.dto';
import { DataSource } from 'typeorm';
import { UsuarioEntity } from 'src/usuario/usuario.entity';
import { EspacioEntity } from 'src/espacio/espacio.entity';
import { EventoDto1 } from './dto/evento.dto1';
import { TimeoutError } from 'rxjs';
import { EventoDtoU } from './dto/evento.dtou';

@Controller('evento')
export class EventoController {

   private usuariocontrol;
   private espaciocontrol;
   
   constructor(private readonly eventoservice: EventoService, private dataSource: DataSource)
   {
      this.usuariocontrol = this.dataSource.getRepository(UsuarioEntity);
      this.espaciocontrol = this.dataSource.getRepository(EspacioEntity);
   }

   //Actualizar

   //Crear Evento Presidente / Empresa
   @Post()
   async create(@Body() dto1:EventoDto1)
   {
      try
      {
         const usuario = await this.usuariocontrol.findOneBy({nombre: dto1.id_usuario});
         if (!usuario) 
         {
            throw new BadRequestException('Usuario no encontrado');
         }
         const espacio = await this.espaciocontrol.findOneBy({nombre: dto1.id_espacio});
         if (!espacio) 
         {
            throw new BadRequestException('Espacio no encontrado');
         }
         let costito = espacio.costo + dto1.capacidad_personas * 2 + (dto1.hora_fin - dto1.hora_inicio) * 10;
         switch (dto1.tipo_evento) 
         {
            case 'Medioambientales':
              costito = costito + 50;
              break;
            case 'Cultural':
               costito = costito + 60;
               break;
            case 'Comida':
               costito = costito + 80;
               break;
            case 'Politica':
               costito = costito + 100;
               break;
         }
         console.log('hasta aqui bien');
         const dto: EventoDto ={
            nombre : dto1.nombre,
            tipo_evento: dto1.tipo_evento,
            descripcion: dto1.descripcion,
            id_usuario: usuario.id,
            id_espacio: espacio.id,
            fecha_evento: dto1.fecha_evento,
            capacidad_personas: dto1.capacidad_personas,
            hora_inicio: dto1.hora_inicio,
            hora_fin: dto1.hora_fin,
            costo: costito,
            tipo_pago:dto1.tipo_pago,
            img_evento: dto1.img_evento
         }
         return await  this.eventoservice.create(dto);
      } catch (error) 
      {
         console.error('Error en el servidor:', error); // Agrega este log
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Ver eventos Usuario Normal (nombre,fecha_evento,hora_inicio,hora_fin,espacio)
   @Get('eventos-Usernormal')
   async eventosUserNoraml()
   {
      try{
         const eventosdisponibles = await this.eventoservice.EventosUsuarioNormal();
         if (eventosdisponibles.length === 0) 
         {
            return {
               message: 'No hay eventos'};
         }
         else
         {
            return {
               message: 'Eventos disponibles encontrados',
               data: eventosdisponibles};
         }
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }   
   }

   //Eventos por fecha (nombre,fecha_evento,hora_inicio,hora_fin,espacio)
   @Get('filtrar-fecha')
   async getEventosByFecha(@Body() body: {fecha:string})
   {
      try{
         const {fecha}=body;
         const eventosdisponibles = await this.eventoservice.EventosFechaUserNormal(fecha);
         if (eventosdisponibles.length === 0) {
            return {
               message: 'No hay eventos en esta fecha'
            };
         }
         else
         {
            return {
               message: 'Eventos disponibles encontrados',
               data: eventosdisponibles
            };
         } 
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }
   
   //Ver eventos propios Presidente / Empresa (completo)
   @Post('eventos-Creador')
   async eventosCreador(@Body() body: {NombreCreador:string})
   {
      try{
         const {NombreCreador} = body;
         const eventosCreador = await this.eventoservice.EventosCreador(NombreCreador);
         if (eventosCreador.length === 0) 
         {
            return {
               message: 'No hay eventos registrados'};
         }
         else
         {
            return {
               message: 'Eventos disponibles encontrados',
               data: eventosCreador};
         }
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Ver evento completo ADMIN (completo)
   @Get('eventos-Admin')
   async eventosAdmin(@Body() body: {NombreAdmin:string})
   {
      try{
         const {NombreAdmin} = body;
         const eventosAdmin = await this.eventoservice.EventosAdmin(NombreAdmin);
         if (eventosAdmin.length === 0) 
         {
            return {
               message: 'No hay eventos registrados'};
         }
         else
         {
            return {
               message: 'Eventos disponibles encontrados',
               data: eventosAdmin};
         }
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Ver eventos pendientes completo ADMIN (completo)
   @Get ('eventos-pend')
   async eventospendiente (@Body() body: {nombreadmin: string})
   {
      try{
         const {nombreadmin} = body;
         const eventos = await this.eventoservice.eventosPendiente(nombreadmin);
         if (eventos.length === 0) 
            {
               return {
                  message: 'No hay eventos pendientes'};
            }
            else
            {
               return {
                  message: 'Eventos pendientes encontrados',
                  data: eventos};
            }
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
      
   }

   //Cambiar dueño evento
   @Patch('change-user')
   async changeUser(@Body() body: { usuarioNombre: string; eventoNombre: string }) 
   {
      try{
         const { usuarioNombre, eventoNombre } = body;
         return await this.eventoservice.changeuser(usuarioNombre, eventoNombre);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Cambiar lugar evento
   @Patch('reubicar')
   async reubicar(@Body() body: {usuarioAdmin:string,eventoNombre:string; espacioNombre:string})
   {
      try{
         const {usuarioAdmin,eventoNombre,espacioNombre} = body;
         return await this.eventoservice.reubicar(usuarioAdmin,eventoNombre,espacioNombre);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Cambiar estado de evento
   @Patch('actualizar-estado')
   async actualizarEstado(@Body() body: {id_evento:number,status:string})
   {
      try{
         const {id_evento,status}=body;
         return await this.eventoservice.updateStatus(id_evento,status);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Avisar tiempo max permisos
   @Get('aviso-permisos')
   async calcularDiasHastaEvento(@Body() body: {nomevento: string}): Promise<string> 
   {
      try{
         const {nomevento} = body;
         const canti = await this.eventoservice.calcularDiasHastaEvento(nomevento);
         return (`Quedan ${canti} dias para entregar los permisos`);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Eliminar Evento
   @Delete('eliminar-evento')
   async eliminarevento(@Body() body: {id_evento: number}) 
   {
      try{
         const {id_evento} = body;
         return await this.eventoservice.deleteevento(id_evento);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }
   
   //Tener los eventos de un espacio
   @Get('eventos-espacio')
   async getEventosEspacio(@Body() body:{nomEspacio:string})
   {
      try
      {
         const {nomEspacio} = body;
         return await this.eventoservice.eventosEspacio(nomEspacio);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Agregar permisos
   @Put('actualizar-evento')
   async actualizarevento(@Body() dto1:EventoDtoU)
   {
      try
      {
         const usuario = await this.usuariocontrol.findOneBy({nombre: dto1.id_usuario});
         if (!usuario) 
         {
            throw new BadRequestException('Usuario no encontrado');
         }
         const espacio = await this.espaciocontrol.findOneBy({nombre: dto1.id_espacio});
         if (!espacio) 
         {
            throw new BadRequestException('Espacio no encontrado');
         }
         return await  this.eventoservice.actualizar(dto1);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }

   //Ver espacio del evento
   @Post('espacio-evento')
   async espacioEvento(@Body() body: {nomEvento:string})
   {
      try
      {
      const {nomEvento} = body;
      return await this.eventoservice.EspacioEvento(nomEvento);
      } catch (error) 
      {
         if (error instanceof TimeoutError) 
         {  // Verifica si el error es por tiempo de espera
           throw new RequestTimeoutException('La conexión con la base de datos está tardando demasiado. Intenta más tarde.');
         }
          // Si es otro tipo de error, lanzamos un error interno
         throw new InternalServerErrorException('Hubo un problema. Intenta más tarde.');
      }
   }
}

/*


   

   
GENERAL
   
*/