"use client";
import { toSlug } from "@/shared/lib/to-slug";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery, useUpdateMeMutation, useUploadUserProfileFileMutation, useGetMySupplierProfileQuery, useUpdateSupplierProfileMutation } from "@/shared/api/api";
import { useAppSelector } from "@/store/hooks";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";

/* eslint-disable @next/next/no-img-element */

export default function ProfilePage() {
  const router = useRouter();
  const sessionUser = useAppSelector((s) => s.auth.user);
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);
  const isSupplier = sessionUser?.roles.includes("supplier") ?? false;

  useEffect(() => {
    if (!isHydrated) return;
    if (!sessionUser) router.replace("/auth/login?next=/profile");
  }, [isHydrated, sessionUser, router]);

  const { data: me } = useMeQuery(undefined, { skip: !isHydrated || !sessionUser });
  const [updateMe] = useUpdateMeMutation();
  const [uploadProfileFile] = useUploadUserProfileFileMutation();

  const { data: myProfile } = useGetMySupplierProfileQuery(undefined, { skip: !isSupplier || !isHydrated || !sessionUser });
  const [updateProfile, { isLoading: isSavingSupplier }] = useUpdateSupplierProfileMutation();

  const [editEmail, setEditEmail] = useState(sessionUser?.email ?? "");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkFacebook, setLinkFacebook] = useState("");
  const [linkInstagram, setLinkInstagram] = useState("");
  const [linkTikTok, setLinkTikTok] = useState("");
  const [linkYouTube, setLinkYouTube] = useState("");
  const [linkWhatsApp, setLinkWhatsApp] = useState("");

  const [userSaved, setUserSaved] = useState(false);
  const [supplierSaved, setSupplierSaved] = useState(false);
  const [userError, setUserError] = useState("");
  const [supplierError, setSupplierError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [emailLoaded, setEmailLoaded] = useState(false);

  useEffect(() => {
    if (me && !emailLoaded) {
      setEditEmail(me.email ?? "");
      setEditAvatarUrl(me.avatarImageUrl ?? "");
      setEditCoverUrl(me.coverImageUrl ?? "");
      setEmailLoaded(true);
    }
  }, [me, emailLoaded]);

  useEffect(() => {
    if (myProfile) {
      setBusinessName(myProfile.businessName ?? "");
      setDescription(myProfile.description ?? "");
      setPhone(myProfile.phone ?? "");
      setWebsite(myProfile.website ?? "");
      const links = myProfile.socialLinks ?? [];
      setLinkFacebook(links.find((l) => l.platform === "facebook")?.url ?? "");
      setLinkInstagram(links.find((l) => l.platform === "instagram")?.url ?? "");
      setLinkTikTok(links.find((l) => l.platform === "tiktok")?.url ?? "");
      setLinkYouTube(links.find((l) => l.platform === "youtube")?.url ?? "");
      setLinkWhatsApp(links.find((l) => l.platform === "whatsapp")?.url ?? "");
    }
  }, [myProfile]);

  const phoneRegex = useMemo(() => /^(05\d{8}|\+972\d{9})$/, []);
  const phoneError = phone && !phoneRegex.test(phone) ? "Israeli phone required (05XXXXXXXX or +972XXXXXXXXX)" : null;
  const websiteError = website && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/.test(website) ? "Enter a valid website URL" : null;
  const emailError = editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim()) ? "Invalid email format" : null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSaveUser = async () => {
    setUserError("");
    setUserSaved(false);
    if (emailError) return;
    setIsSubmitting(true);
    try {
      let avatarUrl = editAvatarUrl;
      let coverUrl = editCoverUrl;
      if (avatarFile) {
        const result = await uploadProfileFile({ file: avatarFile, imageKind: "avatar" }).unwrap();
        if (result.avatarImageUrl) avatarUrl = result.avatarImageUrl;
      }
      if (coverFile) {
        const result = await uploadProfileFile({ file: coverFile, imageKind: "cover" }).unwrap();
        if (result.coverImageUrl) coverUrl = result.coverImageUrl;
      }
      await updateMe({
        email: editEmail.trim() || undefined,
        avatarImageUrl: avatarUrl || undefined,
        coverImageUrl: coverUrl || undefined,
      }).unwrap();
      setAvatarFile(null);
      setCoverFile(null);
      setEditAvatarUrl(avatarUrl);
      setEditCoverUrl(coverUrl);
      setAvatarPreview("");
      setCoverPreview("");
      setUserSaved(true);
    } catch {
      setUserError("Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSupplier = async () => {
    setSupplierError("");
    setSupplierSaved(false);
    const socialLinks: { platform: string; url: string }[] = [];
    if (linkFacebook.trim()) socialLinks.push({ platform: "facebook", url: linkFacebook.trim() });
    if (linkInstagram.trim()) socialLinks.push({ platform: "instagram", url: linkInstagram.trim() });
    if (linkTikTok.trim()) socialLinks.push({ platform: "tiktok", url: linkTikTok.trim() });
    if (linkYouTube.trim()) socialLinks.push({ platform: "youtube", url: linkYouTube.trim() });
    if (linkWhatsApp.trim()) socialLinks.push({ platform: "whatsapp", url: linkWhatsApp.trim() });
    try {
      await updateProfile({
        businessName,
        slug: toSlug(businessName),
        description,
        phone: phone || undefined,
        website: website || undefined,
        socialLinks,
      }).unwrap();
      setSupplierSaved(true);
    } catch {
      setSupplierError("Failed to save supplier profile.");
    }
  };

  if (!isHydrated || !sessionUser) return null;

  return (
    <section className="relative min-h-screen overflow-x-hidden pt-20 sm:pt-24 lg:pt-[123px]" dir="rtl" lang="he" style={{ fontFamily: marketingPloniFont }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[url('/images/background-1.png')] bg-cover bg-center opacity-30" />
      </div>
      <div className="relative z-10 mx-auto max-w-[640px] px-4 pb-16 sm:px-6">
        <h1 className="text-3xl text-[#201C44]">My Profile</h1>

        <div className="mt-8 rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
          <h2 className="text-lg text-[#201C44]">Account</h2>

          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-2 text-sm text-[#444650]">
              <span>Cover Image</span>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isSubmitting}
                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#201C44]/30 bg-slate-50 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coverPreview || editCoverUrl ? (
                  <img src={coverPreview || editCoverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#201C44]/60">
                    <img src="/icons/upload.svg" alt="" className="size-8 opacity-40" />
                    <span className="text-sm">Click to upload cover image</span>
                  </div>
                )}
              </button>
              {coverFile && <p className="text-xs text-[#0061A7]">New cover selected — save to apply</p>}
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#444650]">
              <span>Avatar Image</span>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#201C44]/30 bg-slate-50 transition hover:bg-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {avatarPreview || editAvatarUrl ? (
                    <img src={avatarPreview || editAvatarUrl} alt="" className="absolute inset-0 h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#201C44]/60">
                      <img src="/icons/upload.svg" alt="" className="size-5 opacity-40" />
                      <span className="text-[10px]">Upload</span>
                    </div>
                  )}
                </button>
                <div>
                  <p className="text-xs text-slate-400">Click the circle to upload a new avatar</p>
                  {avatarFile && <p className="text-xs text-[#0061A7] mt-1">New avatar selected — save to apply</p>}
                </div>
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm text-[#444650]">
              <span>Email</span>
              <input value={editEmail} disabled className="h-12 rounded bg-slate-50 px-4 text-left text-base text-slate-500 outline-none border border-slate-200 cursor-not-allowed" dir="ltr" />
              {emailError && <p className="text-xs text-red-600">{emailError}</p>}
            </label>

            {userError && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{userError}</div>}
            {userSaved && <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">Profile saved!</div>}

            <button type="button" onClick={handleSaveUser} disabled={isSubmitting || !!emailError} className="flex h-12 w-full items-center justify-center gap-2 rounded-[99px] bg-[#201C44] text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting && (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isSubmitting ? "Saving..." : "Save Account"}
            </button>
          </div>
        </div>

        {isSupplier && (
          <div className="mt-6 rounded-2xl border border-[#BFDBFE] bg-white p-6 shadow-sm">
            <h2 className="text-lg text-[#201C44]">Supplier Profile</h2>
            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-2 text-sm text-[#444650]">
                <span>Business Name</span>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={isSavingSupplier} className="h-12 rounded bg-white/60 px-4 text-right text-base outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Business name" dir="rtl" />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#444650]">
                <span>Description</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSavingSupplier} className="h-32 rounded bg-white/60 px-4 py-3 text-right text-base outline-none border border-slate-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Describe your business" dir="rtl" />
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#444650]">
                <span>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))} maxLength={13} disabled={isSavingSupplier} className="h-12 rounded bg-white/60 px-4 text-right text-base outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="05XXXXXXXX" dir="ltr" />
                {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
              </label>

              <label className="flex flex-col gap-2 text-sm text-[#444650]">
                <span>Website</span>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} disabled={isSavingSupplier} className="h-12 rounded bg-white/60 px-4 text-right text-base outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="https://example.com" dir="ltr" />
                {websiteError && <p className="text-xs text-red-600">{websiteError}</p>}
              </label>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-medium text-[#201C44] mb-3">Digital Presence</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { label: "Facebook", value: linkFacebook, setter: setLinkFacebook, placeholder: "https://facebook.com/..." },
                    { label: "Instagram", value: linkInstagram, setter: setLinkInstagram, placeholder: "https://instagram.com/..." },
                    { label: "TikTok", value: linkTikTok, setter: setLinkTikTok, placeholder: "https://tiktok.com/..." },
                    { label: "YouTube", value: linkYouTube, setter: setLinkYouTube, placeholder: "https://youtube.com/..." },
                    { label: "WhatsApp", value: linkWhatsApp, setter: setLinkWhatsApp, placeholder: "https://wa.me/..." },
                  ] as const).map(({ label, value, setter, placeholder }) => (
                    <label key={label} className="flex flex-col gap-1 text-sm text-[#444650]">
                      <span className="text-xs text-slate-400">{label}</span>
                      <input value={value} onChange={(e) => setter(e.target.value)} disabled={isSavingSupplier} className="h-10 rounded bg-white/60 px-3 text-left text-sm outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" placeholder={placeholder} dir="ltr" />
                    </label>
                  ))}
                </div>
              </div>

              {supplierError && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{supplierError}</div>}
              {supplierSaved && <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">Supplier profile saved!</div>}

              <button type="button" onClick={handleSaveSupplier} disabled={isSavingSupplier || !!phoneError || !!websiteError} className="flex h-12 w-full items-center justify-center gap-2 rounded-[99px] bg-[#201C44] text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {isSavingSupplier && (
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {isSavingSupplier ? "Saving..." : "Save Supplier Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
