import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function loadPublicContent() {
  if (!supabase) return { galleryPhotos: null, reviews: null };

  const [galleryResult, reviewsResult] = await Promise.all([
    supabase
      .from("gallery_photos")
      .select("id, category_id, label, file_url, alt, sort_order")
      .eq("is_active", true)
      .order("category_id", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("reviews")
      .select("id, name, event_date, quote, rating")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ]);

  if (galleryResult.error) throw galleryResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  return {
    galleryPhotos: galleryResult.data ?? [],
    reviews: reviewsResult.data ?? [],
  };
}

export async function submitVisitorReview({ name, quote, rating = 5 }) {
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const { error } = await supabase.from("reviews").insert({
    name: name.trim(),
    quote: quote.trim(),
    rating: Number(rating),
    status: "pending",
  });

  if (error) throw error;
}

export async function signInAdmin(email, password) {
  if (!supabase) throw new Error("Supabase is not configured yet.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) return { user: null, profile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", user.id)
    .single();

  if (error) return { user, profile: null };
  return { user, profile };
}

export async function loadAdminReviews() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, event_date, quote, rating, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateReviewStatus(id, status) {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function uploadGalleryPhoto({ file, categoryId, alt }) {
  if (!supabase) throw new Error("Supabase is not configured yet.");

  const ext = file.name.split(".").pop() || "jpg";
  const safeName = `${categoryId}/${crypto.randomUUID()}.${ext.toLowerCase()}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(safeName, file, { cacheControl: "31536000", upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("gallery").getPublicUrl(safeName);

  const { error: insertError } = await supabase.from("gallery_photos").insert({
    category_id: categoryId,
    label: categoryId,
    file_url: data.publicUrl,
    alt: alt?.trim() || "תמונה מהגלריה",
    is_active: true,
  });

  if (insertError) throw insertError;
}
