import { roleEnum } from "@/module/roles/enums/roles.enum";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean  {
        const requiredRoles = this.reflector.getAllAndOverride<roleEnum[]>(
            ROLES_KEY,[context.getHandler(),context.getClass()]
        )
        if(!requiredRoles){
            return true;
        }
        const request =context.switchToHttp().getRequest<{user?:{roleId:string}}>()
        if(!request.user){
            throw new UnauthorizedException("Authentication is required.")
        } 
        const allowed = requiredRoles.some((role)=>role ===request.user?.roleId)
        if(!allowed){
            throw new ForbiddenException( 'You do not have permission to access this resource.')
        }
        return true;
    }
}