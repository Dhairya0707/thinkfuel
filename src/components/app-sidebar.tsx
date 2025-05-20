"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import {
  aiToolsBlock,
  ideasBlock,
  resourcesBlock,
  settingsSupportBlock,
} from "@/app/Utils/slidebardata";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: any }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          Accounttype={user.firestore.isPro ? "🚀 Pro Mode" : "⚡ Free Mode"}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain item={ideasBlock} />
        <NavMain item={aiToolsBlock} />
        <NavMain item={resourcesBlock} />
        <NavMain item={settingsSupportBlock} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// "use client";

// import * as React from "react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { NavMain } from "@/components/nav-main";
// import { TeamSwitcher } from "@/components/team-switcher";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import { NavUser } from "./nav-user";
// import {
//   aiToolsBlock,
//   ideasBlock,
//   resourcesBlock,
//   settingsSupportBlock,
//   user,
// } from "@/app/Utils/slidebardata";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { auth, db } from "../../service/firebase.config";
// import { useRouter } from "next/navigation";

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const loading = true;
//   const router = useRouter();
//   const [user, setUser] = React.useState<any>(null);

//   React.useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         try {
//           const userDocRef = doc(db, "users", firebaseUser.uid);
//           const userSnap = await getDoc(userDocRef);

//           if (userSnap.exists()) {
//             const profileData = userSnap.data();
//             setUser(profileData);
//           } else {
//             console.warn("No Firestore data for user");
//             setUser(firebaseUser);
//           }
//         } catch (error) {
//           console.error("Error fetching user profile:", error);
//           setUser(firebaseUser);
//         }
//       } else {
//         router.push("/login");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
//       </div>
//     );
//   }

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         {loading ? (
//           <Skeleton className="h-8 w-full rounded-md animate-pulse" />
//         ) : (
//           <TeamSwitcher
//             // Accounttype={userData?.isPro ? "🚀 Pro Mode" : "⚡ Free Mode"}
//             Accounttype={"⚡ Free Mode"}
//           />
//         )}
//       </SidebarHeader>
//       <SidebarContent>
//         {loading ? (
//           <div className="space-y-4 p-4">
//             <Skeleton className="h-6 w-2/3" />
//             <Skeleton className="h-6 w-3/4" />
//             <Skeleton className="h-6 w-1/2" />
//             <Skeleton className="h-6 w-3/5" />
//             <Skeleton className="h-6 w-2/4" />
//             <Skeleton className="h-6 w-3/4" />
//             <Skeleton className="h-6 w-3/4" />
//           </div>
//         ) : (
//           <>
//             <NavMain item={ideasBlock} />
//             <NavMain item={aiToolsBlock} />
//             <NavMain item={resourcesBlock} />
//             <NavMain item={settingsSupportBlock} />
//           </>
//         )}
//       </SidebarContent>
//       <SidebarFooter>
//         {loading ? (
//           <Skeleton className="h-14 w-full" />
//         ) : // <NavUser user={user} />
//         null}
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   );
// }
