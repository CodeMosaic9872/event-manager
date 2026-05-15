/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");  
const p = "E:\\Project\\New folder\\event-manager\\frontend\\event-suppliers-nextjs\\src\\app\\supplier\\dashboard\\page.tsx";  
let c = fs.readFileSync(p, "utf8");  
const eol = c.includes("\r\n") ? "\r\n" : "\n";  
const oldBlock = ["  const { data: referralData } = useGetSupplierReferralLinkQuery(undefined, {","    skip: shouldSkipProtectedQueries,","  });","  const { data: profileData } = useGetMySupplierProfileQuery(undefined, {","    skip: shouldSkipProtectedQueries,","  });"].join(eol);  
const newBlock = ["  const { data: me } = useMeQuery(undefined, { skip: shouldSkipProtectedQueries });","  const { data: profileData } = useGetMySupplierProfileQuery(undefined, {","    skip: shouldSkipProtectedQueries,","  });","  const { data: referralData } = useGetSupplierReferralLinkQuery(profileData?.id || '', {","    skip: shouldSkipProtectedQueries || !profileData?.id,","  });"].join(eol);  
if (c.includes(oldBlock)) { c = c.replace(oldBlock, newBlock); fs.writeFileSync(p, c, "utf8"); console.log("Blocks replaced"); } else { console.log("Pattern not found"); }  
