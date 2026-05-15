const fs = require('fs');

// Fix profile/page.tsx - wrap setState in startTransition
let c = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

c = c.replace(
  '  useEffect(() => {\r\n    if (me && !emailLoaded) {\r\n      setEditEmail(me.email ?? "");\r\n      setEditAvatarUrl(me.avatarImageUrl ?? "");\r\n      setEditCoverUrl(me.coverImageUrl ?? "");\r\n      setEmailLoaded(true);\r\n    }\r\n  }, [me, emailLoaded]);',
  '  useEffect(() => {\r\n    if (me && !emailLoaded) {\r\n      startTransition(() => {\r\n        setEditEmail(me.email ?? "");\r\n        setEditAvatarUrl(me.avatarImageUrl ?? "");\r\n        setEditCoverUrl(me.coverImageUrl ?? "");\r\n        setEmailLoaded(true);\r\n      });\r\n    }\r\n  }, [me, emailLoaded]);'
);

c = c.replace(
  '  useEffect(() => {\r\n    if (myProfile) {\r\n      setBusinessName(myProfile.businessName ?? "");\r\n      setDescription(myProfile.description ?? "");\r\n      setPhone(myProfile.phone ?? "");\r\n      setWebsite(myProfile.website ?? "");\r\n      const links = myProfile.socialLinks ?? [];\r\n      setLinkFacebook(links.find((l) => l.platform === "facebook")?.url ?? "");\r\n      setLinkInstagram(links.find((l) => l.platform === "instagram")?.url ?? "");\r\n      setLinkTikTok(links.find((l) => l.platform === "tiktok")?.url ?? "");\r\n      setLinkYouTube(links.find((l) => l.platform === "youtube")?.url ?? "");\r\n      setLinkWhatsApp(links.find((l) => l.platform === "whatsapp")?.url ?? "");\r\n    }\r\n  }, [myProfile]);',
  '  useEffect(() => {\r\n    if (myProfile) {\r\n      startTransition(() => {\r\n        setBusinessName(myProfile.businessName ?? "");\r\n        setDescription(myProfile.description ?? "");\r\n        setPhone(myProfile.phone ?? "");\r\n        setWebsite(myProfile.website ?? "");\r\n        const links = myProfile.socialLinks ?? [];\r\n        setLinkFacebook(links.find((l) => l.platform === "facebook")?.url ?? "");\r\n        setLinkInstagram(links.find((l) => l.platform === "instagram")?.url ?? "");\r\n        setLinkTikTok(links.find((l) => l.platform === "tiktok")?.url ?? "");\r\n        setLinkYouTube(links.find((l) => l.platform === "youtube")?.url ?? "");\r\n        setLinkWhatsApp(links.find((l) => l.platform === "whatsapp")?.url ?? "");\r\n      });\r\n    }\r\n  }, [myProfile]);'
);
fs.writeFileSync('src/app/profile/page.tsx', c, 'utf8');
console.log('profile: startTransition applied');

// Fix dashboard
let d = fs.readFileSync('src/app/supplier/dashboard/page.tsx', 'utf8');
if (!d.includes('startTransition')) {
  d = d.replace(
    "import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from \"react\";",
    "import { ChangeEvent, FormEvent, startTransition, useEffect, useMemo, useRef, useState } from \"react\";"
  );
}

d = d.replace(
  '  useEffect(() => {\r\n    const mp = me?.marketplaceProfile;\r\n    if (!mp) return;\r\n    setBusinessName(mp.businessName);\r\n    if (mp.description) setDescription(mp.description);\r\n    setLinkEmail(mp.email ?? "");\r\n    setLinkPhone(mp.phone ?? "");\r\n    setLinkFacebook(mp.facebook ?? "");\r\n    setLinkInstagram(mp.instagram ?? "");\r\n    setLinkYoutube(mp.socialLinks?.find((s: { platform: string }) => s.platform === "youtube")?.url ?? "");\r\n    setLinkTiktok(mp.socialLinks?.find((s: { platform: string }) => s.platform === "tiktok")?.url ?? "");\r\n    setLinkWebsite(mp.website ?? "");\r\n    setLinkWhatsapp(mp.whatsapp ?? "");\r\n  }, [me?.marketplaceProfile]);',
  '  useEffect(() => {\r\n    const mp = me?.marketplaceProfile;\r\n    if (!mp) return;\r\n    startTransition(() => {\r\n      setBusinessName(mp.businessName);\r\n      if (mp.description) setDescription(mp.description);\r\n      setLinkEmail(mp.email ?? "");\r\n      setLinkPhone(mp.phone ?? "");\r\n      setLinkFacebook(mp.facebook ?? "");\r\n      setLinkInstagram(mp.instagram ?? "");\r\n      setLinkYoutube(mp.socialLinks?.find((s: { platform: string }) => s.platform === "youtube")?.url ?? "");\r\n      setLinkTiktok(mp.socialLinks?.find((s: { platform: string }) => s.platform === "tiktok")?.url ?? "");\r\n      setLinkWebsite(mp.website ?? "");\r\n      setLinkWhatsapp(mp.whatsapp ?? "");\r\n    });\r\n  }, [me?.marketplaceProfile]);'
);
fs.writeFileSync('src/app/supplier/dashboard/page.tsx', d, 'utf8');
console.log('dashboard: startTransition applied');

// Fix tenders/edit
let t = fs.readFileSync('src/app/user/tenders/[tenderId]/edit/page.tsx', 'utf8');
if (!t.includes('startTransition')) {
  t = t.replace(
    'import { FormEvent, useEffect, useState } from "react";',
    'import { FormEvent, startTransition, useEffect, useState } from "react";'
  );
}

t = t.replace(
  '  useEffect(() => {\r\n    if (currentTender) setForm(mapJobToForm(currentTender));\r\n  }, [currentTender]);',
  '  useEffect(() => {\r\n    if (currentTender) startTransition(() => setForm(mapJobToForm(currentTender)));\r\n  }, [currentTender]);'
);
fs.writeFileSync('src/app/user/tenders/[tenderId]/edit/page.tsx', t, 'utf8');
console.log('tenders edit: startTransition applied');

// Fix dropdown
let j = fs.readFileSync('src/shared/components/jobs/job-category-filter-dropdown.tsx', 'utf8');
if (!j.includes('startTransition')) {
  j = j.replace(
    'import { useCallback, useEffect, useId, useState } from "react";',
    'import { startTransition, useCallback, useEffect, useId, useState } from "react";'
  );
}

j = j.replace(
  '  useEffect(() => {\r\n    if (open) {\r\n      setDraft(new Set(appliedCategories));\r\n    }\r\n  }, [open, appliedCategories]);',
  '  useEffect(() => {\r\n    if (open) {\r\n      startTransition(() => setDraft(new Set(appliedCategories)));\r\n    }\r\n  }, [open, appliedCategories]);'
);
fs.writeFileSync('src/shared/components/jobs/job-category-filter-dropdown.tsx', j, 'utf8');
console.log('dropdown: startTransition applied');

console.log('\nAll startTransition fixes applied');
