import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommonService } from "../common/common.service";
import { File } from "./entities/file.entity";
import { mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createReadStream } from "node:fs";
import { randomUUID } from "node:crypto";
import { renderVideoThumbnail } from "./video-thumbnail";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,

    private readonly commonService: CommonService,
  ) {}
  async findOne(stringId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: {
        stringId,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    return file;
  }

  async create(file: Express.Multer.File): Promise<File> {
    const fileShare = new File();

    fileShare.deleteKey = this.commonService.randomString();
    fileShare.deletePass = this.commonService.randomString();
    fileShare.stringId = this.commonService.randomString();

    fileShare.fileName = file.filename;
    fileShare.originalFileName = file.originalname;
    fileShare.fileType = file.mimetype;

    await this.fileRepo.save(fileShare);

    return fileShare;
  }

  async findOneByDeleteKey(deleteKey: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: {
        deleteKey,
      },
    });

    if (!file) {
      throw new NotFoundException();
    }

    return file;
  }

  async delete(deleteKey: string) {
    const result = await this.fileRepo.delete({
      deleteKey,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async deleteFile(file: File) {
    const path = join(process.cwd(), "uploads", "files", file.fileName);
    await unlink(path);

    const thumbnailPath = join(process.cwd(), "thumbnails", "files", `${file.fileName}.jpg`);
    await rm(thumbnailPath, { force: true });
    const framePath = join(process.cwd(), "thumbnails", "files", `${file.fileName}.frame.jpg`);
    await rm(framePath, { force: true });
  }

  async videoThumbnail(file: File): Promise<Buffer> {
    const directory = join(process.cwd(), "thumbnails", "files");
    const thumbnailPath = join(directory, `${file.fileName}.frame.jpg`);

    try {
      const thumbnail = await readFile(thumbnailPath);
      return thumbnail;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "ENOENT") {
        throw error;
      }
    }

    const videoPath = join(process.cwd(), "uploads", "files", file.fileName);
    const thumbnail = await renderVideoThumbnail(videoPath);
    await mkdir(directory, { recursive: true });
    const temporaryId = randomUUID();
    const temporaryPath = `${thumbnailPath}.${temporaryId}.tmp`;

    try {
      await writeFile(temporaryPath, thumbnail);
      await rename(temporaryPath, thumbnailPath);
    } finally {
      await rm(temporaryPath, { force: true });
    }

    return thumbnail;
  }

  streamFile(file: File): StreamableFile {
    return new StreamableFile(
      createReadStream(join(process.cwd(), "uploads", "files", file.fileName)),
    );
  }
}
