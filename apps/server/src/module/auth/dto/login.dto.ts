import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "ducanh@gmail.com" })
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @ApiProperty({ example: "ducanhdz123" })
    @IsNotEmpty()
    password: string;
}
