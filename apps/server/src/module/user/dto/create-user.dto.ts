import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({example:"ducanh@gmail.com"})
    @IsEmail()
    @IsString()
    email:string;
    @ApiProperty({example:"ducanhdz123"})
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password:string;
}
