import { auth } from "@/firebase/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadImage = async (
  file: File,
  bucketName: string,
  folderPath: string = ""
): Promise<string | null> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("사용자가 로그인하지 않았습니다.");
    }

    const fileName = `${folderPath}${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
        metadata: {
          blogOwnerUid: user.uid, // 인증된 사용자의 UID를 설정
        },
      });

    if (error) {
      alert("이미지 업로드 실패:" + JSON.stringify(error));
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl || null;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export default uploadImage;
