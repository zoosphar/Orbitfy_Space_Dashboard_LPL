import {
  FEATURED_IMAGE_API_URL,
  FEATURED_IMAGE_API_URL_PROD,
  SAVE_IMAGE_METADATA_API_URL,
} from "./constants";

export const postFeaturedImage = async ({ fileKey, method }) => {
  const response = await fetch(FEATURED_IMAGE_API_URL, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileKey: fileKey,
      httpMethod: method,
      removeImage: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to post the image.");
  }

  return response.json();
};

export const markImageAsRemoved = async ({ fileKey, method }) => {
  const response = await fetch(FEATURED_IMAGE_API_URL, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      removeImage: true,
      fileKey: fileKey,
      httpMethod: method,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark the image removed.");
  }

  return response.json();
};

export const saveImageMetadata = async ({ imageName, tagName, modelName }) => {
  const response = await fetch(SAVE_IMAGE_METADATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageName,
      tagName,
      modelName,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save the image metadata.");
  }

  return response.json();
};
