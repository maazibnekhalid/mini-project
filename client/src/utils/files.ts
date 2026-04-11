const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getUploadUrl(filePath?: string) {
  if (!filePath) {
    return "";
  }

  const origin = apiBaseUrl.replace(/\/api$/, "");
  const normalizedInput = filePath.replace(/\\/g, "/");
  const uploadsIndex = normalizedInput.lastIndexOf("/uploads/");
  const relativePath =
    uploadsIndex >= 0
      ? normalizedInput.slice(uploadsIndex + 1)
      : normalizedInput.startsWith("uploads/")
        ? normalizedInput
        : `uploads/${normalizedInput.split("/").pop()}`;
  const normalizedPath = relativePath.replace(/^\/+/, "");
  return `${origin}/${normalizedPath}`;
}
