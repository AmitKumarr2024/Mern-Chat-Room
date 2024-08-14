const uploadFile = async (file) => {
  const fileType = file.type.startsWith("video/") ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME
  }/${fileType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-me-app");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const dataResponse = await response.json();

    if (!response.ok) {
      console.error("Upload error response:", dataResponse);
      throw new Error(
        `HTTP error! Status: ${response.status} - ${dataResponse.error.message}`
      );
    }

    return dataResponse;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default uploadFile;
