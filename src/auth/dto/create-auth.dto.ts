import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAuthDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({type: String, example: 'example@gmail.com'})
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @ApiProperty({type: String})
    password: string;
}
