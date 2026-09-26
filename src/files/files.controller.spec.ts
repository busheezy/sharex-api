import { ForbiddenException, NotFoundException, StreamableFile } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CommonConfigService } from "../common/common.config";
import { CommonService } from "../common/common.service";
import { File } from "./entities/file.entity";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { Readable } from "node:stream";
import { join } from "node:path";
import type { Request, Response } from "express";

const mockRes = {
  set: jest.fn(),
};

describe("FilesController", () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        FilesService,
        CommonService,
        CommonConfigService,
        ConfigService,
        {
          provide: getRepositoryToken(File),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("watch", () => {
    it.each([
      ["https", "http", "https"],
      [undefined, "http", "http"],
    ])(
      "renders the player with forwarded protocol %s",
      async (forwardedProtocol, protocol, expectedProtocol) => {
        const file = new File();
        file.fileType = "video/mp4";
        file.originalFileName = "clip & <script>\"'.mp4";
        file.deleteKey = "private-delete-key";
        file.deletePass = "private-delete-pass";
        jest.spyOn(service, "findOne").mockResolvedValue(file);
        const get = jest.fn().mockImplementation((name: string) => {
          if (name === "host") {
            return "videos.example";
          }

          return forwardedProtocol;
        });
        const req = {
          get,
          protocol,
          originalUrl: "/f/abcdef/watch?tracking=secret",
        } as unknown as Request;
        const set = jest.fn();
        const res = { set } as unknown as Response;
        const html = await controller.watch("abcdef", req, res);
        const baseUrl = `${expectedProtocol}://videos.example/f/abcdef`;

        expect(service.findOne).toHaveBeenCalledWith("abcdef");
        expect(set).toHaveBeenCalledWith({ "Content-Type": "text/html; charset=utf-8" });
        expect(html).toContain('<video controls playsinline preload="metadata"');
        expect(html).toContain(`<meta property="og:url" content="${baseUrl}/watch">`);
        expect(html).toContain(`<meta property="og:video" content="${baseUrl}/video">`);
        expect(html).toContain('<meta property="og:video:type" content="video/mp4">');
        expect(html).toContain(`<source src="${baseUrl}/video" type="video/mp4">`);
        expect(html).toContain(`<a href="${baseUrl}">Download video</a>`);
        expect(html).toContain("clip &amp; &lt;script&gt;&quot;&#39;.mp4");
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("tracking=secret");
        expect(html).not.toContain(file.deleteKey);
        expect(html).not.toContain(file.deletePass);
      },
    );

    it("rejects non-video files without rendering a page", async () => {
      const file = new File();
      file.fileType = "text/plain";
      jest.spyOn(service, "findOne").mockResolvedValue(file);
      const req = {} as Request;
      const set = jest.fn();
      const res = { set } as unknown as Response;
      const result = controller.watch("abcdef", req, res);

      await expect(result).rejects.toThrow("Video not found");
      expect(set).not.toHaveBeenCalled();
    });

    it("returns not found for an unknown video", async () => {
      const error = new NotFoundException();
      jest.spyOn(service, "findOne").mockRejectedValue(error);
      const req = {} as Request;
      const res = {} as Response;
      const result = controller.watch("missing", req, res);

      await expect(result).rejects.toBe(error);
    });
  });

  describe("video", () => {
    it("serves the stored video inline with byte ranges enabled", async () => {
      const file = new File();
      file.fileType = "video/webm";
      file.fileName = "stored-video";
      jest.spyOn(service, "findOne").mockResolvedValue(file);
      const sendFile = jest.fn();
      const res = { sendFile } as unknown as Response;
      const root = join(process.cwd(), "uploads", "files");

      await controller.video("abcdef", res);

      expect(service.findOne).toHaveBeenCalledWith("abcdef");
      expect(sendFile).toHaveBeenCalledWith("stored-video", {
        root,
        headers: {
          "Content-Type": "video/webm",
          "Content-Disposition": "inline",
          "X-Content-Type-Options": "nosniff",
        },
        acceptRanges: true,
      });
    });

    it("rejects non-video files without sending them inline", async () => {
      const file = new File();
      file.fileType = "text/html";
      jest.spyOn(service, "findOne").mockResolvedValue(file);
      const sendFile = jest.fn();
      const res = { sendFile } as unknown as Response;
      const result = controller.video("abcdef", res);

      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(sendFile).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a file", async () => {
      const mockFile = new File();
      mockFile.deleteKey = "abcdef";
      mockFile.deletePass = "ghijkl";
      mockFile.fileName = "fileName.txt";
      mockFile.fileType = "text/plain";
      mockFile.id = 0;
      mockFile.stringId = "abcdef";

      jest.spyOn(service, "findOne").mockResolvedValue(mockFile);
      jest.spyOn(service, "streamFile").mockReturnValue(new StreamableFile(Buffer.from("")));

      expect(await controller.findOne("abcdef", mockRes)).toBeInstanceOf(StreamableFile);
    });

    describe("otherwise", () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, "findOne").mockReturnValue(null);

        await expect(controller.findOne("abcdef", mockRes)).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });

  describe("create", () => {
    it("should create a file", async () => {
      const file = new File();
      file.deleteKey = "abcdef";
      file.deletePass = "ghijkl";
      file.fileName = "fileName.txt";
      file.fileType = "text/plain";
      file.id = 0;
      file.stringId = "abcdef";

      jest.spyOn(service, "create").mockResolvedValue(file);

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

      await expect(controller.create(mockFile)).resolves.toBeInstanceOf(File);
    });
  });

  describe("deleteCode", () => {
    it("should return a file by delete key", async () => {
      const mockFile = new File();
      mockFile.deleteKey = "abcdef";
      mockFile.deletePass = "ghijkl";
      mockFile.fileName = "fileName.txt";
      mockFile.fileType = "text/plain";
      mockFile.id = 0;
      mockFile.stringId = "abcdef";

      jest.spyOn(service, "findOneByDeleteKey").mockResolvedValue(mockFile);
      expect(await controller.deleteCode("abcdef")).toBe("ghijkl");
    });
  });

  describe("delete", () => {
    it("should delete a file by delete key", async () => {
      const mockFile = new File();
      mockFile.deleteKey = "abcdef";
      mockFile.deletePass = "ghijkl";
      mockFile.fileName = "fileName.txt";
      mockFile.fileType = "text/plain";
      mockFile.id = 0;
      mockFile.stringId = "abcdef";

      jest.spyOn(service, "delete").mockResolvedValue();
      jest.spyOn(service, "deleteFile").mockResolvedValue();
      jest.spyOn(service, "findOneByDeleteKey").mockResolvedValue(mockFile);

      await expect(controller.delete("abcdef", "ghijkl")).resolves.toBe("Deleted");
    });

    it("reject if missing password", async () => {
      const mockFile = new File();
      mockFile.deleteKey = "abcdef";
      mockFile.deletePass = "ghijkl";
      mockFile.fileName = "fileName.txt";
      mockFile.fileType = "text/plain";
      mockFile.id = 0;
      mockFile.stringId = "abcdef";

      jest.spyOn(service, "delete").mockResolvedValue();
      jest.spyOn(service, "findOneByDeleteKey").mockResolvedValue(mockFile);

      await expect(controller.delete("abcdef", "")).rejects.toBeInstanceOf(ForbiddenException);
    });

    describe("otherwise", () => {
      it('should throw the "NotFoundException"', async () => {
        jest.spyOn(service, "findOneByDeleteKey").mockRejectedValue(new NotFoundException());

        await expect(controller.delete("mnopqr", "ghijkl")).rejects.toBeInstanceOf(
          NotFoundException,
        );
      });
    });
  });
});
