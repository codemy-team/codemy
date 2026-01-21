import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
});

export const buildFolder = (path) => {
    const prefix = env.cloudinaryFolderPrefix || "codemy";
    if (!path) {
        return prefix;
    }
    return `${prefix}/${path.replace(/^\/+|\/+$/g, "")}`;
};

export const signUpload = ({ resourceType, folder, publicId }) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
        timestamp,
        folder
    };
    if (publicId) {
        paramsToSign.public_id = publicId;
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        env.cloudinaryApiSecret
    );

    return {
        cloudName: env.cloudinaryCloudName,
        apiKey: env.cloudinaryApiKey,
        timestamp,
        signature,
        folder,
        publicId,
        resourceType,
        uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/${resourceType}/upload`
    };
};

export { cloudinary };
