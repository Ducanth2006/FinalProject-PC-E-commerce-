import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto{
    @ApiProperty({example:"toiTenLaQue@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email:string
    @ApiProperty({example:"toiTenLaQue123"})
    @IsNotEmpty()
    password:string;
}