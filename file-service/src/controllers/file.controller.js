const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Cấu hình AWS S3 client cho MinIO:
const s3 = new AWS.S3({
  endpoint: process.env.MINIO_ENDPOINT, // Ví dụ: "http://minio:9000" nếu chạy qua Docker Compose, hoặc "http://localhost:9000" nếu local
  s3ForcePathStyle: true,                // Bắt buộc với MinIO
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Kiểm tra và tạo bucket nếu chưa tồn tại
 * @param {string} bucketName - Tên bucket
 */
async function ensureBucketExists(bucketName) {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket "${bucketName}" đã tồn tại.`);
  } catch (err) {
    // Nếu lỗi 404 tức không tìm thấy bucket, thì tạo mới
    if (err.statusCode === 404) {
      console.log(`Bucket "${bucketName}" không tồn tại. Đang tạo...`);
      await s3.createBucket({ Bucket: bucketName }).promise();
      console.log(`Bucket "${bucketName}" đã được tạo.`);
    } else {
      console.error("Lỗi kiểm tra bucket:", err);
      throw err;
    }
  }
}

/**
 * Hàm upload file từ local (thư mục uploads) lên MinIO
 * @param {string} localFilePath - Đường dẫn file trên máy cục bộ
 * @param {string} key - Tên key (tên file) khi lưu trên MinIO
 * @returns {Promise} - Trả về promise chứa thông tin file trên MinIO
 */
function uploadFileToMinIO(localFilePath, key) {
  const fileContent = fs.readFileSync(localFilePath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Tên bucket đã được xác định trong .env
    Key: key,
    Body: fileContent,
  };
  return s3.upload(params).promise();
}

exports.uploadFile = async (req, res) => {
  console.log("Upload request received:", req.body);
  console.log("File object received:", req.file);

  if (!req.file) {
    console.error("No file was uploaded!");
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    // Đường dẫn file cục bộ (Multer lưu vào thư mục uploads)
    const localFilePath = path.join(__dirname, '../../uploads/', req.file.filename);

    // Đảm bảo bucket tồn tại
    await ensureBucketExists(process.env.AWS_BUCKET_NAME);

    // Upload file lên MinIO
    const minioResponse = await uploadFileToMinIO(localFilePath, req.file.filename);
    console.log("MinIO upload response:", minioResponse);
    
    // (Tùy chọn) Xoá file local nếu không cần nữa:
    // fs.unlinkSync(localFilePath);
    
    return res.status(200).json({ 
      message: 'File uploaded successfully', 
      file: {
        ...req.file,
        minioUrl: minioResponse.Location  // URL trên MinIO
      }
    });
  } catch (err) {
    console.error("Error in uploadFile:", err);
    return res.status(500).json({ message: 'Error uploading file to MinIO', error: err.message });
  }
};

exports.downloadFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads', filename);
  console.log("Downloading file from:", filePath);
  
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      return res.status(500).json({ message: 'Error downloading file', error: err.message });
    }
  });
};
