import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { renderVideoThumbnail } from "./video-thumbnail";

jest.mock("node:child_process", () => {
  const actual = jest.requireActual("node:child_process");
  const execFile = jest.fn();
  const custom = Symbol.for("nodejs.util.promisify.custom");
  execFile[custom] = jest.fn();

  return { ...actual, execFile };
});

const executeFile = promisify(execFile) as jest.Mock;

describe("renderVideoThumbnail", () => {
  beforeEach(() => {
    executeFile.mockReset();
  });

  it.each([
    [640, 360],
    [360, 640],
  ])("renders a %s by %s frame as a letterboxed JPEG without an overlay", async (width, height) => {
    const create = { width, height, channels: 3 as const, background: "#ff0000" };
    const frame = await sharp({ create }).png().toBuffer();
    const stderr = Buffer.alloc(0);
    executeFile.mockResolvedValue({ stdout: frame, stderr });
    const videoPath = "/uploads/clip with spaces;echo.mp4";

    const thumbnail = await renderVideoThumbnail(videoPath);
    const metadata = await sharp(thumbnail).metadata();
    const center = await sharp(thumbnail)
      .extract({ left: 640, top: 360, width: 1, height: 1 })
      .raw()
      .toBuffer();
    const corner = await sharp(thumbnail)
      .extract({ left: 10, top: 10, width: 1, height: 1 })
      .raw()
      .toBuffer();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1280);
    expect(metadata.height).toBe(720);
    expect(center[0]).toBeGreaterThan(240);
    expect(center[1]).toBeLessThan(10);
    expect(center[2]).toBeLessThan(10);
    expect(executeFile).toHaveBeenCalledWith(
      "ffmpeg",
      expect.arrayContaining([
        "-i",
        videoPath,
        "-protocol_whitelist",
        "file,pipe",
        "-frames:v",
        "1",
        "pipe:1",
      ]),
      expect.objectContaining({ encoding: "buffer", timeout: 30_000, maxBuffer: 5 * 1024 * 1024 }),
    );

    if (width < height) {
      expect(corner[0]).toBeLessThan(10);
      expect(corner[1]).toBeLessThan(10);
      expect(corner[2]).toBeLessThan(10);
      return;
    }

    expect(corner[0]).toBeGreaterThan(240);
    expect(corner[1]).toBeLessThan(10);
    expect(corner[2]).toBeLessThan(10);
  });

  it("propagates FFmpeg failures", async () => {
    const error = new Error("FFmpeg timed out");
    executeFile.mockRejectedValue(error);

    const result = renderVideoThumbnail("/uploads/broken.mp4");

    await expect(result).rejects.toBe(error);
  });

  it("rejects an invalid decoded image", async () => {
    const stdout = Buffer.from("invalid image");
    const stderr = Buffer.alloc(0);
    executeFile.mockResolvedValue({ stdout, stderr });

    const result = renderVideoThumbnail("/uploads/broken.mp4");

    await expect(result).rejects.toThrow();
  });
});
