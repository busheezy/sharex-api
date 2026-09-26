import { NotFoundException, StreamableFile } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Readable } from "node:stream";
import { mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CommonService } from "../common/common.service";
import { createMockRepository, MockRepository } from "../common/mock.repo";
import { File } from "./entities/file.entity";
import { FilesService } from "./files.service";
import { renderVideoThumbnail } from "./video-thumbnail";

jest.mock("./video-thumbnail", () => ({
  renderVideoThumbnail: jest.fn(),
}));

jest.mock("node:fs/promises", () => {
  const actual = jest.requireActual("node:fs/promises");
  return {
    ...actual,
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn(),
    rename: jest.fn().mockResolvedValue(undefined),
    rm: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(null),
    writeFile: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("node:fs", () => {
  const actual = jest.requireActual("node:fs");
  return {
    ...actual,
    createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  };
});

describe("FilesService", () => {
  let service: FilesService;
  let fileRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        CommonService,
        {
          provide: getRepositoryToken(File),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get<MockRepository>(getRepositoryToken(File));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(fileRepository).toBeDefined();
  });

  describe("create", () => {
    describe("when creating a file", () => {
      it("the file should be created", async () => {
        const mockFile: Express.Multer.File = {
          buffer: Buffer.from(""),
          destination: "./",
          fieldname: "file",
          filename: "alksjdhfaksjdfhasfd",
          mimetype: "text/plain",
          originalname: "file.txt",
          path: "./uploads/files/alksjdhfaksjdfhasfd",
          size: 123123,
          stream: new Readable(),
          encoding: "utf-8",
        };

        const expectedFile: Partial<File> = {
          fileName: mockFile.originalname,
          fileType: mockFile.mimetype,
        };

        jest.spyOn(fileRepository, "save").mockReturnValue(expectedFile);

        const file = await service.create(mockFile);

        expect(file.originalFileName).toBe(expectedFile.fileName);
        expect(file.fileType).toBe(expectedFile.fileType);
      });
    });
  });

  describe("findOne", () => {
    describe("when file with string ID exists", () => {
      it("should return the file object", async () => {
        const fileId = "abcdef";
        const expectedFile = {};

        jest.spyOn(fileRepository, "findOne").mockReturnValue(expectedFile);
        const file = await service.findOne(fileId);
        expect(file).toBe(expectedFile);
      });
    });

    describe("otherwise", () => {
      it('should throw the "NotFoundException"', async () => {
        const fileId = "abcdef";
        jest.spyOn(fileRepository, "findOne").mockReturnValue(null);

        try {
          await service.findOne(fileId);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe("Not Found");
        }
      });
    });
  });

  describe("findOneByDeleteKey", () => {
    describe("when file with delete key exists", () => {
      it("should return the file object", async () => {
        const deleteKey = "abcdef";
        const expectedFile = {};

        jest.spyOn(fileRepository, "findOne").mockReturnValue(expectedFile);

        const file = await service.findOneByDeleteKey(deleteKey);
        expect(file).toBe(expectedFile);
      });
    });

    describe("otherwise", () => {
      it('should throw the "NotFoundException"', async () => {
        const deleteKey = "abcdef";
        jest.spyOn(fileRepository, "findOne").mockReturnValue(undefined);

        try {
          await service.findOneByDeleteKey(deleteKey);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe("Not Found");
        }
      });
    });
  });

  describe("delete", () => {
    describe("when deleting", () => {
      it("no errors", async () => {
        const deleteKey = "abcdef";

        jest.spyOn(fileRepository, "delete").mockReturnValue({ affected: 1 });
        await service.delete(deleteKey);
        expect(fileRepository.delete).toHaveBeenCalled();
      });
    });

    describe("otherwise", () => {
      it("it should explode", async () => {
        const deleteKey = "abcdef";

        jest.spyOn(fileRepository, "delete").mockReturnValue({ affected: 0 });

        try {
          await service.delete(deleteKey);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toBe("Not Found");
        }
      });
    });
  });

  describe("delete file", () => {
    const mockFile = new File();
    mockFile.deleteKey = "abcdef";
    mockFile.deletePass = "ghijkl";
    mockFile.fileName = "fileName.txt";
    mockFile.fileType = "text/plain";
    mockFile.id = 0;
    mockFile.stringId = "abcdef";

    describe("when deleting file", () => {
      it("no errors", async () => {
        const deleteFile = await service.deleteFile(mockFile);
        const filePath = join(process.cwd(), "uploads", "files", mockFile.fileName);
        const thumbnailPath = join(
          process.cwd(),
          "thumbnails",
          "files",
          `${mockFile.fileName}.jpg`,
        );

        expect(deleteFile).toBe(undefined);
        expect(unlink).toHaveBeenCalledWith(filePath);
        expect(rm).toHaveBeenCalledWith(thumbnailPath, { force: true });
        const framePath = join(
          process.cwd(),
          "thumbnails",
          "files",
          `${mockFile.fileName}.frame.jpg`,
        );
        expect(rm).toHaveBeenCalledWith(framePath, { force: true });
      });
    });
  });

  describe("videoThumbnail", () => {
    const file = new File();
    file.fileName = "stored-video";
    const directory = join(process.cwd(), "thumbnails", "files");
    const thumbnailPath = join(directory, "stored-video.frame.jpg");
    const videoPath = join(process.cwd(), "uploads", "files", file.fileName);
    const thumbnail = Buffer.from("preview");
    const missingFile = Object.assign(new Error("Missing cache"), { code: "ENOENT" });

    beforeEach(() => {
      jest.clearAllMocks();
      jest.mocked(readFile).mockReset().mockRejectedValue(missingFile);
      jest.mocked(renderVideoThumbnail).mockReset().mockResolvedValue(thumbnail);
      jest.mocked(writeFile).mockReset().mockResolvedValue(undefined);
      jest.mocked(rename).mockReset().mockResolvedValue(undefined);
    });

    it("returns a cached image without decoding the video", async () => {
      jest.mocked(readFile).mockResolvedValue(thumbnail);

      const result = await service.videoThumbnail(file);

      expect(result).toBe(thumbnail);
      expect(readFile).toHaveBeenCalledWith(thumbnailPath);
      expect(renderVideoThumbnail).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it("generates a missing preview and publishes the complete cache atomically", async () => {
      const result = await service.videoThumbnail(file);
      const temporaryPath = jest.mocked(writeFile).mock.calls[0][0];

      expect(result).toBe(thumbnail);
      expect(renderVideoThumbnail).toHaveBeenCalledWith(videoPath);
      expect(mkdir).toHaveBeenCalledWith(directory, { recursive: true });
      expect(temporaryPath).toEqual(
        expect.stringMatching(/stored-video\.frame\.jpg\.[\w-]+\.tmp$/),
      );
      expect(writeFile).toHaveBeenCalledWith(temporaryPath, thumbnail);
      expect(rename).toHaveBeenCalledWith(temporaryPath, thumbnailPath);
      expect(rm).toHaveBeenCalledWith(temporaryPath, { force: true });
    });

    it("propagates cache access errors without regenerating the preview", async () => {
      const error = Object.assign(new Error("Access denied"), { code: "EACCES" });
      jest.mocked(readFile).mockRejectedValue(error);

      const result = service.videoThumbnail(file);

      await expect(result).rejects.toBe(error);
      expect(renderVideoThumbnail).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it("does not cache a failed video decode", async () => {
      const error = new Error("Invalid video");
      jest.mocked(renderVideoThumbnail).mockRejectedValue(error);

      const result = service.videoThumbnail(file);

      await expect(result).rejects.toBe(error);
      expect(writeFile).not.toHaveBeenCalled();
      expect(rename).not.toHaveBeenCalled();
    });

    it("cleans up the temporary image when writing fails", async () => {
      const error = new Error("Disk full");
      jest.mocked(writeFile).mockRejectedValue(error);

      const result = service.videoThumbnail(file);

      await expect(result).rejects.toBe(error);
      const temporaryPath = jest.mocked(writeFile).mock.calls[0][0];
      expect(rm).toHaveBeenCalledWith(temporaryPath, { force: true });
      expect(rename).not.toHaveBeenCalled();
    });

    it("cleans up the temporary image when publishing fails", async () => {
      const error = new Error("Rename failed");
      jest.mocked(rename).mockRejectedValue(error);

      const result = service.videoThumbnail(file);

      await expect(result).rejects.toBe(error);
      const temporaryPath = jest.mocked(writeFile).mock.calls[0][0];
      expect(rm).toHaveBeenCalledWith(temporaryPath, { force: true });
      expect(rename).toHaveBeenCalledWith(temporaryPath, thumbnailPath);
    });
  });

  describe("stream file", () => {
    const mockFile = new File();
    mockFile.deleteKey = "abcdef";
    mockFile.deletePass = "ghijkl";
    mockFile.fileName = "fileName.txt";
    mockFile.fileType = "text/plain";
    mockFile.id = 0;
    mockFile.stringId = "abcdef";

    describe("when streaming file", () => {
      it("no errors", async () => {
        const deleteFile = service.streamFile(mockFile);
        expect(deleteFile).toBeInstanceOf(StreamableFile);
      });
    });
  });
});
