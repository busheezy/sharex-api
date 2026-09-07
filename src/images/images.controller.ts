import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Param,
  Response,
  Request,
  Get,
  StreamableFile,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ImagesService } from "./images.service";
import { CreateImageDto } from "./dto/create-image.dto";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiProduces, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Auth } from "../auth/auth.decorator";

@Controller("i")
@ApiTags("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(":id/thumbnail")
  @ApiOkResponse({
    description: "We are returning the image thumbnail.",
    schema: {
      type: "string",
      format: "binary",
    },
  })
  @ApiProduces("image/*")
  async findOneThumbnail(
    @Param("id") stringId: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const image = await this.imagesService.findOne(stringId);

    res.set({
      "Content-Type": image.fileType,
    });

    return this.imagesService.streamImageThumbnail(image);
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Image file upload.",
    type: CreateImageDto,
  })
  @UseInterceptors(FileInterceptor("image"))
  @Auth()
  async create(@UploadedFile(new ParseFilePipe()) file: Express.Multer.File) {
    await this.imagesService.generateThumbnail(file);
    return this.imagesService.create(file);
  }

  @Get("delete/:key")
  async deleteCode(@Param("key") key: string) {
    const image = await this.imagesService.findOneByDeleteKey(key);

    if (!image) {
      throw new NotFoundException();
    }

    const { deletePass } = image;

    return deletePass;
  }

  @Get("delete/:key/:pass")
  async delete(@Param("key") key: string, @Param("pass") pass: string) {
    const image = await this.imagesService.findOneByDeleteKey(key);

    if (!image) {
      throw new NotFoundException();
    }

    const { deletePass } = image;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    await this.imagesService.deleteImages(image);
    await this.imagesService.delete(key);

    return "Deleted";
  }
  @Get([":id", ":id/:fileName"])
  @ApiOkResponse({
    description: "We are returning the image.",
    schema: {
      type: "string",
      format: "binary",
    },
  })
  @ApiProduces("image/*")
  async findOne(
    @Param("id") stringId: string,
    @Response({ passthrough: true }) res,
    @Request() req?: { path: string },
  ): Promise<StreamableFile> {
    const image = await this.imagesService.findOne(stringId);

    if (!image) {
      throw new NotFoundException();
    }

    const path = req?.path;

    const isBasePath = path === `/i/${stringId}` || path === `/i/${stringId}/`;

    if (isBasePath) {
      const fileName = encodeURIComponent(image.originalFileName);
      return res.redirect(`/i/${stringId}/${fileName}`);
    }

    const contentType = image.fileType;
    res.set({
      "Content-Type": contentType,
    });

    return this.imagesService.streamImage(image);
  }
}
