const request = require("supertest");
const app = require("../src/server");
const path = require("path");

describe("File Service Endpoints", () => {
  it("should upload a file successfully", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .set("Content-Type", "multipart/form-data")  // Đảm bảo Content-Type đúng
      .attach("file", path.resolve(__dirname, "../assets/test-image.jpg"));

    console.log("Upload response:", res.body);
    console.log("Upload status:", res.statusCode);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "File uploaded successfully");
    expect(res.body).toHaveProperty("file");
    expect(res.body.file).toHaveProperty("filename");
  });

  it("should download a file successfully", async () => {
    // Đầu tiên, upload file để lấy filename
    const uploadRes = await request(app)
      .post("/api/files/upload")
      .set("Content-Type", "multipart/form-data")  // Đảm bảo Content-Type đúng
      .attach("file", path.resolve(__dirname, "../assets/test-image.jpg"));

    console.log("Upload response (download test):", uploadRes.body);

    expect(uploadRes.statusCode).toEqual(200);
    expect(uploadRes.body).toHaveProperty("file");
    expect(uploadRes.body.file).toHaveProperty("filename");

    const filename = uploadRes.body.file.filename;

    // Gọi endpoint download
    const downloadRes = await request(app)
      .get(`/api/files/download/${filename}`);

    expect(downloadRes.statusCode).toEqual(200);
    expect(downloadRes.header['content-disposition']).toEqual(expect.stringContaining(filename));
  });
});
