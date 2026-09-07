import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class CreateImageDto {
  @ApiProperty({ type: "string", format: "binary" })
  image: Express.Multer.File;
}
