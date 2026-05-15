"use server";

import connectDB from "@/lib/db";
import ImageModel from "@/lib/models/Image";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUserImages() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];
  await connectDB();
  const userId = (session.user as any).id;
  const images = await ImageModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(images));
}

export async function getPublicImages() {
  await connectDB();
  const images = await ImageModel.find({ isPublic: true }).sort({ createdAt: -1 }).lean();
  
  // Fetch users
  const { default: UserModel } = await import("@/lib/models/User");
  const userIds = Array.from(new Set(images.map((img: any) => img.userId)));
  const users = await UserModel.find({ _id: { $in: userIds } }).lean();
  
  const userMap = users.reduce((acc: any, user: any) => {
    acc[user._id.toString()] = {
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl
    };
    return acc;
  }, {});
  
  const imagesWithUsers = images.map(img => ({
    ...img,
    user: userMap[img.userId] || null
  }));
  
  return JSON.parse(JSON.stringify(imagesWithUsers));
}

export async function toggleImagePublic(imageId: string, isPublic: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectDB();
  const userId = (session.user as any).id;
  await ImageModel.findOneAndUpdate({ _id: imageId, userId }, { isPublic });
  return true;
}

export async function toggleLikeImage(imageId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectDB();
  const userId = (session.user as any).id;
  
  const image = await ImageModel.findById(imageId);
  if (!image) throw new Error("Not found");
  
  const hasLiked = image.likes?.includes(userId);
  if (hasLiked) {
    await ImageModel.findByIdAndUpdate(imageId, { $pull: { likes: userId } });
  } else {
    await ImageModel.findByIdAndUpdate(imageId, { $addToSet: { likes: userId } });
  }
  return !hasLiked;
}

export async function deleteImage(imageId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectDB();
  const userId = (session.user as any).id;
  await ImageModel.findOneAndDelete({ _id: imageId, userId });
  return true;
}

export async function createImage(payload: { prompt: string; imageUrl: string; isPublic?: boolean }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectDB();
  const userId = (session.user as any).id;
  const newImage = await ImageModel.create({
    userId,
    prompt: payload.prompt,
    imageUrl: payload.imageUrl,
    isPublic: payload.isPublic ?? false,
  });
  return JSON.parse(JSON.stringify(newImage));
}

export async function getCloudinarySignature() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "visgen-references" },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}

export async function uploadImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "visgen-references",
    });
    return { url: uploadResponse.secure_url };
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Failed to upload image to storage");
  }
}

export async function generateImage(prompt: string, imageReferences?: string[], isPublic = false) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectDB();
  const userId = (session.user as any).id;
  
  // Verify credits
  const { default: UserModel } = await import("@/lib/models/User");
  const user = await UserModel.findById(userId);
  if (!user || user.credits < 1) {
    throw new Error("Insufficient credits. Please upgrade your plan.");
  }

  // Credit will be deducted only after a successful upload — see below
  let creditDeducted = false;
  
  // Pollinations.ai Authenticated Implementation
  const apiKey = process.env.POLLINATIONS_API_KEY;

  try {
    const isImageToImage = imageReferences && imageReferences.length > 0;
    let tempImageUrl = "";

    if (isImageToImage) {
      // Use the classic GET endpoint for specialized in-context generation (kontext model)
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrls = imageReferences.join("|");
      tempImageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=kontext&image=${imageUrls}&nologo=true&seed=-1&width=1024&height=1024`;
      
      // Since it's a GET request, we need to add the API key either via query or header. 
      // Most reliable for Pollinations GET is ?key=...
      tempImageUrl += `&key=${apiKey}`;
      
      console.log("Using kontext (image-to-image) GET URL:", tempImageUrl);
    } else {
      // Standard Text-to-Image using POST
      const response = await fetch("https://gen.pollinations.ai/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "flux",
          size: "1024x1024",
          response_format: "url",
          nologo: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "AI Generation failed");
      }

      const data = await response.json();
      tempImageUrl = data.data[0].url;
    }

    console.log("Pollinations URL received:", tempImageUrl);

    let finalImageUrl = tempImageUrl;

    try {
      // 1. Fetch the image data directly from Pollinations
      const imageResponse = await fetch(tempImageUrl);
      if (!imageResponse.ok) throw new Error("Could not download image from AI");
      
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      // 2. Upload to Cloudinary (deduct credit only on success)
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "visgen-creations",
      });

      finalImageUrl = uploadResponse.secure_url;
      console.log("Cloudinary upload successful:", finalImageUrl);

      // 3. Deduct credit now that we have a confirmed result
      await UserModel.findByIdAndUpdate(userId, { $inc: { credits: -1 } });
      creditDeducted = true;
    } catch (uploadError) {
      console.error("Image Processing Failed:", uploadError);
      // Fallback to temporary pollinations URL — still deduct credit (generation happened)
      if (tempImageUrl.includes("pollinations.ai") && !tempImageUrl.includes("key=")) {
        finalImageUrl = `${tempImageUrl}${tempImageUrl.includes("?") ? "&" : "?"}key=${apiKey}`;
      }
      await UserModel.findByIdAndUpdate(userId, { $inc: { credits: -1 } });
      creditDeducted = true;
    }

    return await createImage({ prompt, imageUrl: finalImageUrl, isPublic });
  } catch (error) {
    console.error("CRITICAL GENERATION ERROR:", error);
    // Only refund if a credit was actually deducted
    if (creditDeducted) {
      await UserModel.findByIdAndUpdate(userId, { $inc: { credits: 1 } });
    }
    throw new Error(error instanceof Error ? error.message : "Image generation failed. Please try again.");
  }
}
