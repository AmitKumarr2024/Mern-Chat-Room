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

    // Ensure that the URL is using HTTPS
    const secureUrl = dataResponse.url.replace("http://", "https://");
    
    // Log the secure URL (optional)
    console.log('Secure URL:', secureUrl);

    // Return the modified secure URL instead of the original
    return { ...dataResponse, url: secureUrl };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default uploadFile;
