import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_VERSION = 20;
const ZIP_UTF8_FLAG = 0x0800;
const ZIP_DEFLATE_METHOD = 8;
const ZIP_LOCAL_HEADER_SIZE = 30;
const ZIP_CENTRAL_HEADER_SIZE = 46;
const ZIP_END_RECORD_SIZE = 22;
const CRC32_INITIAL_VALUE = 0xffffffff;
const CRC32_POLYNOMIAL = 0xedb88320;
const DEFAULT_SOURCE_DIRECTORY = "default-course-pack";
const DEFAULT_OUTPUT_FILE = "dist/default-course-pack.zip";

const packageDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceDirectory = path.resolve(
  packageDirectory,
  process.argv[2] || DEFAULT_SOURCE_DIRECTORY,
);
const outputFile = path.resolve(
  packageDirectory,
  process.argv[3] || DEFAULT_OUTPUT_FILE,
);

/**
 * 递归收集课程包文件，并使用 POSIX 分隔符作为 ZIP 内部路径。
 * @param {string} directory 当前扫描目录
 * @param {string} relativeDirectory ZIP 内相对目录
 * @returns {{ absolutePath: string, archivePath: string }[]} 文件列表
 */
function collectFiles(directory, relativeDirectory = "") {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      const archivePath = path.posix.join(
        relativeDirectory,
        entry.name,
      );
      return entry.isDirectory()
        ? collectFiles(absolutePath, archivePath)
        : [{ absolutePath, archivePath }];
    });
}

/**
 * 计算 ZIP 文件条目要求的 CRC32 校验值。
 * @param {Buffer} data 原始文件内容
 * @returns {number} 无符号 CRC32
 */
function calculateCrc32(data) {
  let checksum = CRC32_INITIAL_VALUE;
  for (const byte of data) {
    checksum ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      checksum =
        (checksum >>> 1) ^
        (checksum & 1 ? CRC32_POLYNOMIAL : 0);
    }
  }
  return (checksum ^ CRC32_INITIAL_VALUE) >>> 0;
}

/**
 * 将课程包目录压缩为无额外外层目录的 ZIP。
 * @param {string} sourcePath 课程包源目录
 * @param {string} destinationPath ZIP 输出路径
 */
function createZip(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Course pack directory does not exist: ${sourcePath}`);
  }

  const files = collectFiles(sourcePath);
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.absolutePath);
    const compressedData = zlib.deflateRawSync(data);
    const archivePath = Buffer.from(file.archivePath, "utf8");
    const checksum = calculateCrc32(data);

    const localHeader = Buffer.alloc(ZIP_LOCAL_HEADER_SIZE);
    localHeader.writeUInt32LE(ZIP_LOCAL_FILE_HEADER_SIGNATURE, 0);
    localHeader.writeUInt16LE(ZIP_VERSION, 4);
    localHeader.writeUInt16LE(ZIP_UTF8_FLAG, 6);
    localHeader.writeUInt16LE(ZIP_DEFLATE_METHOD, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(archivePath.length, 26);
    localParts.push(localHeader, archivePath, compressedData);

    const centralHeader = Buffer.alloc(
      ZIP_CENTRAL_HEADER_SIZE,
    );
    centralHeader.writeUInt32LE(
      ZIP_CENTRAL_DIRECTORY_SIGNATURE,
      0,
    );
    centralHeader.writeUInt16LE(ZIP_VERSION, 4);
    centralHeader.writeUInt16LE(ZIP_VERSION, 6);
    centralHeader.writeUInt16LE(ZIP_UTF8_FLAG, 8);
    centralHeader.writeUInt16LE(ZIP_DEFLATE_METHOD, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(archivePath.length, 28);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralParts.push(centralHeader, archivePath);

    localOffset +=
      localHeader.length + archivePath.length + compressedData.length;
  }

  const centralDirectorySize = centralParts.reduce(
    (total, part) => total + part.length,
    0,
  );
  const endRecord = Buffer.alloc(ZIP_END_RECORD_SIZE);
  endRecord.writeUInt32LE(
    ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE,
    0,
  );
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectorySize, 12);
  endRecord.writeUInt32LE(localOffset, 16);

  fs.mkdirSync(path.dirname(destinationPath), {
    recursive: true,
  });
  fs.writeFileSync(
    destinationPath,
    Buffer.concat([...localParts, ...centralParts, endRecord]),
  );

  return files.map((file) => file.archivePath);
}

const archiveEntries = createZip(sourceDirectory, outputFile);
console.log(`Created ${path.relative(packageDirectory, outputFile)}`);
for (const archiveEntry of archiveEntries) {
  console.log(`- ${archiveEntry}`);
}
