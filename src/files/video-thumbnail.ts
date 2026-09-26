import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const executeFile = promisify(execFile);

export async function renderVideoThumbnail(videoPath: string): Promise<Buffer> {
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-protocol_whitelist",
    "file,pipe",
    "-threads",
    "1",
    "-i",
    videoPath,
    "-map",
    "0:v:0",
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=decrease,thumbnail=30",
    "-frames:v",
    "1",
    "-threads",
    "1",
    "-f",
    "image2pipe",
    "-vcodec",
    "mjpeg",
    "pipe:1",
  ];
  const options = { encoding: "buffer" as const, timeout: 30_000, maxBuffer: 5 * 1024 * 1024 };
  const result = await executeFile("ffmpeg", args, options);
  const frame = result.stdout;
  const thumbnail = await sharp(frame)
    .resize(1280, 720, { fit: "contain", background: "#000000" })
    .jpeg({ quality: 85 })
    .toBuffer();

  return thumbnail;
}
