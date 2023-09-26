import { IsNotEmpty, IsString } from "class-validator";

export class CreateFileSocketDto {
    @IsString()
    @IsNotEmpty()
    file_name: string;
}
