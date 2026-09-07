import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class CreateFileDto {
  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
