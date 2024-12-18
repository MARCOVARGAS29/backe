import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioDto } from './dto/usuario.dto';
import { DataSource, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService 
{
  private usuarioRepository;

  constructor(private dataSource: DataSource, private readonly jwtService: JwtService)
  {
    this.usuarioRepository = this.dataSource.getRepository(UsuarioEntity);
  }

  async getusuarios(): Promise<UsuarioEntity[]>
  {
    const usuarios = await this.usuarioRepository.find();
    return usuarios
  }
  
  async findid(id: number): Promise<UsuarioEntity> 
  {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) 
    {
      throw new NotFoundException({ message: 'usuario no existente' });
    }
    return usuario;
  }

  async findnombre(nombre: string, contrasena: string): Promise<any> 
  {
    if (!nombre || !contrasena) 
    {
      throw new NotFoundException({ message: 'Nombre y contraseña son obligatorios' });
    }
    
    const usuario = await this.usuarioRepository.findOne({
      where: { nombre: nombre, contrasena: contrasena }});
    
    if (!usuario) 
    {
      throw new NotFoundException({ message: 'Usuario no existente o contraseña incorrecta' });
    }
    /*if(usuario.tipousuario !== tipo_usuario)
    {
      throw new NotFoundException({ message: 'Este usuario, no tiene acceso a ese tipo de usuario' });
    }*/
    // Generar el token
    const token = this.jwtService.sign({ id: usuario.id, nombre: usuario.nombre });

    return { 
      message: 'Inicio de sesión exitoso',
      usuario: { id: usuario.id, nombre: usuario.nombre },
      token,
    };
  }
    
  async create(dto: UsuarioDto): Promise<any> 
  {
    const usuario = this.usuarioRepository.create(dto);
    await this.usuarioRepository.save(usuario);
    return { message: `usuario ${usuario.nombre} creado` };
  }

  async ascenderSuperAdmin(idSuperAdmin: number, idUsuario: number): Promise<any> 
  {
    const superAdmin = await this.usuarioRepository.findOneBy({ id: idSuperAdmin });
    if (!superAdmin || superAdmin.tipousuario !== 'SuperAdmin') 
    {
      throw new UnauthorizedException('Solo un SuperAdmin puede realizar esta acción');
    }
    const usuario = await this.usuarioRepository.findOneBy({ id: idUsuario });
    if (!usuario) 
    {
      throw new NotFoundException('Usuario no encontrado');
    }
    usuario.tipousuario = 'SuperAdmin';
    await this.usuarioRepository.save(usuario);
    return { message: `Usuario ${usuario.nombre} ascendido a SuperAdmin` };
  }
    
  async descenderAdmin(idSuperAdmin: number, idUsuario: number): Promise<any> 
  {
    const superAdmin = await this.usuarioRepository.findOneBy({ id: idSuperAdmin });
    if (!superAdmin || superAdmin.tipousuario !== 'SuperAdmin') 
    {
      throw new UnauthorizedException('Solo un SuperAdmin puede realizar esta acción');
    }
    const usuario = await this.usuarioRepository.findOneBy({ id: idUsuario });
    if (!usuario || usuario.tipousuario !== "SuperAdmin") 
    {
      throw new NotFoundException('Usuario no encontrado');
    }
      usuario.tipousuario = 'Admin';
      await this.usuarioRepository.save(usuario);
      return { message: `Usuario ${usuario.nombre} descendido a ADMIN` };
  }

  async changeactivado(idAdmin: number, idUsuario: number): Promise<any>
  {
    const admin = await this.usuarioRepository.findOneBy({id:idAdmin});
    if(!admin || admin.tipousuario !== 'Admin' )
    {
      throw new UnauthorizedException('Solo un Admin puede realizar dicha accion');
    }
    const usuario = await this.usuarioRepository.findOneBy({id:idUsuario})
    if(usuario.estado !== 'pendiente')
    {
      throw new UnauthorizedException('Usuario aceptado')
    }
    usuario.estado = 'confirmado';
    await this.usuarioRepository.save(usuario);
    return { message: `Usuario ${usuario.nombre} aprobado` };
  }

  async rechazaruser(idAdmin:number,idUsuario:number): Promise<any>
  {
    const admin = await this.usuarioRepository.findOneBy({id:idAdmin});
    if(!admin || admin.tipousuario != "Admin")
    {
      throw new UnauthorizedException('Solo un Admin realiza dicha accion')
    }
    const usuario = await this.usuarioRepository.findOneBy({id:idUsuario})
    if(usuario.estado !== 'pendiente')
    {
      throw new UnauthorizedException('Usuario rechazado')
    }
    usuario.estado = 'rechazado';
    await this.usuarioRepository.save(usuario);
    return { message: `Usuario ${usuario.nombre} rechazado` };
  }

  async userAdmins(nombreAdmin: string): Promise<any>
  {
    const admin = await this.usuarioRepository.findOneBy({nombre:nombreAdmin});
    if(!admin)
    {
      throw new NotFoundException('Usuario no encontrado'); 
    }
    if(admin.tipousuario != 'SuperAdmin')
    {
      throw new UnauthorizedException('Solo un SuperAdmin realiza dicha accion');
    }
    const usuarios = await this.usuarioRepository.find({where: {tipousuario: In(['Admin', 'SuperAdmin'])}})
    return usuarios;
  }
}
