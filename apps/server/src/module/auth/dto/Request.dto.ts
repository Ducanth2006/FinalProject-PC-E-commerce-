import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class UserAuthResponseDto {
    @ApiProperty({
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "UUID của người dùng",
    })
    @Expose()
    id: string;

    @ApiProperty({ example: "user@example.com" })
    @Expose()
    email: string;

    @ApiProperty({
        format: "uuid",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        description: "UUID của vai trò (Role)",
    })
    @Expose()
    roleId: string;
}

export class RequestDto {
    @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
    @Expose()
    AccessToken: string;

    @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
    @Expose()
    RefreshToken: string;

    @ApiProperty({ type: UserAuthResponseDto })
    @Expose()
    @Type(() => UserAuthResponseDto)
    user: UserAuthResponseDto;
}
