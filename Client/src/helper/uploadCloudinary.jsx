const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`; // Ensure `/image/upload` endpoint

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-me-app"); // Ensure this preset exists in Cloudinary

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const dataResponse = await response.json(); // Parse the response JSON

    if (!response.ok) {
      console.error("Upload error response:", dataResponse);
      throw new Error(`HTTP error! Status: ${response.status} - ${dataResponse.error.message}`);
    }

    return dataResponse; // Return the response JSON
  } catch (error) {
    console.error("Upload error:", error);
    throw error; // Re-throw error for further handling
  }
};


export default uploadFile;
