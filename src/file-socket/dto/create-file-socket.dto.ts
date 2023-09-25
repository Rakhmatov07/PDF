import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFileSocketDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String })
    file_name: string;
}
