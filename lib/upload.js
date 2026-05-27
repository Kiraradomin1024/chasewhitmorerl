import { getSupabase } from "./supabase";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image trop lourde (max 10 Mo)");
  }
  const base64 = await fileToBase64(file);
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke("upload-image", {
    body: { image: base64 },
  });
  if (error) throw new Error(error.message);
  if (!data?.url) throw new Error(data?.error ?? "Réponse invalide");
  return data.url;
}
