const fs = require("fs");
const path = require("path");

// 源文件路径
const sourcePath = path.resolve(__dirname, "dist", "template.html");
// 目标文件路径（根目录）
const targetPathRoot = path.resolve(__dirname, "index.html");
// 目标文件路径（dist 目录）
const targetPathDist = path.resolve(__dirname, "dist", "index.html");

// 复制文件到根目录
fs.copyFile(sourcePath, targetPathRoot, (err) => {
  if (err) {
    console.error("Error copying file to root:", err);
    return;
  }
  console.log("File copied to root successfully!");

  // 复制文件到 dist 目录（重命名为 index.html）
  fs.copyFile(sourcePath, targetPathDist, (err) => {
    if (err) {
      console.error("Error copying file to dist:", err);
      return;
    }
    console.log("File copied to dist successfully!");
  });
});
