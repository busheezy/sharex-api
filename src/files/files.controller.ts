import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Param,
  Get,
  Response,
  StreamableFile,
  NotFoundException,
  ForbiddenException,
  Request,
} from "@nestjs/common";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { join } from "node:path";
import { FilesService } from "./files.service";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateFileDto } from "./dto/create-file.dto";
import { Auth } from "../auth/auth.decorator";
import { renderVideoPlayer } from "./video-player";

@Controller("f")
@ApiTags("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(":id/watch")
  @ApiOkResponse({ description: "A video player page with video embed metadata." })
  async watch(
    @Param("id") stringId: string,
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<string> {
    const file = await this.findVideo(stringId);
    const forwardedProtocol = req.get("x-forwarded-proto");
    const protocol = forwardedProtocol === "https" ? "https" : req.protocol;
    const host = req.get("host");
    const origin = `${protocol}://${host}`;
    const pageUrl = new URL(req.originalUrl, origin);
    pageUrl.search = "";
    const html = renderVideoPlayer(file, pageUrl);

    res.set({ "Content-Type": "text/html; charset=utf-8" });

    return html;
  }

  @Get(":id/video")
  @ApiOkResponse({ description: "Inline video stream with byte range support." })
  async video(@Param("id") stringId: string, @Response() res: ExpressResponse): Promise<void> {
    const file = await this.findVideo(stringId);
    const fileType = file.fileType;
    const root = join(process.cwd(), "uploads", "files");
    const headers = {
      "Content-Type": fileType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    };
    const options = { root, headers, acceptRanges: true };

    res.sendFile(file.fileName, options);
  }

  private async findVideo(stringId: string) {
    const file = await this.filesService.findOne(stringId);
    const isVideo = file.fileType.startsWith("video/");

    if (!isVideo) {
      throw new NotFoundException("Video not found");
    }

    return file;
  }

  @Get(":id")
  @ApiOkResponse({
    description: "We are returning the image.",
    schema: {
      type: "string",
      format: "binary",
    },
  })
  async findOne(
    @Param("id") stringId: string,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const file = await this.filesService.findOne(stringId);

    if (!file) {
      throw new NotFoundException();
    }

    res.set({
      "Content-Type": file.fileType,
      "Content-Disposition": `attachment; filename=${file.originalFileName}`,
    });

    return this.filesService.streamFile(file);
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File upload.",
    type: CreateFileDto,
  })
  @UseInterceptors(FileInterceptor("file"))
  @Auth()
  create(@UploadedFile(new ParseFilePipe()) file: Express.Multer.File) {
    return this.filesService.create(file);
  }

  @Get("delete/:key")
  async deleteCode(@Param("key") key: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    const { deletePass } = file;

    return deletePass;
  }

  @Get("delete/:key/:pass")
  async delete(@Param("key") key: string, @Param("pass") pass: string) {
    const file = await this.filesService.findOneByDeleteKey(key);

    const { deletePass } = file;

    if (deletePass !== pass) {
      throw new ForbiddenException();
    }

    await this.filesService.deleteFile(file);
    await this.filesService.delete(key);

    return "Deleted";
  }
}
