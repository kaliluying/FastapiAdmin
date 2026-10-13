import { request } from "@/utils/http";

const FileAPI = {
  uploadFile(body: FormData) {
    return request<ApiResponse<UploadFilePath>>({
      url: "/common/file/upload?upload_type=avatar",
      method: "post",
      data: body,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default FileAPI;
