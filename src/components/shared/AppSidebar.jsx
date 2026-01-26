"use client";
import {
  ChevronUp,
  LayoutDashboard,
  Home,
  Hexagon,
  CircleQuestionMark,
  Store,
  Handshake,
  Mail,
  Image,
  RefreshCcw,
  ShieldUser,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },

  {
    title: "Home",
    children: [
      { title: "Home Banners", url: "/admin/home/banners", icon: Home },
    ],
    icon: Home,
  },

  {
    title: "About",
    children: [
      {
        title: "About Banners",
        url: "/admin/about/banners",
        icon: CircleQuestionMark,
      },
      {
        title: "Leaders",
        url: "/admin/about/leaders",
        icon: CircleQuestionMark,
      },
    ],
    icon: CircleQuestionMark,
  },

  {
    title: "Brands",
    children: [
      { title: "Brand Logo", url: "/admin/brands/logo", icon: Hexagon },
      {
        title: "Brand Banners",
        url: "/admin/brands/banners",
        icon: Hexagon,
      },
      {
        title: "Brand Section",
        url: "/admin/brands/section",
        icon: Hexagon,
      },
      {
        title: "Brand Consumer",
        url: "/admin/brands/consumer",
        icon: Hexagon,
      },
    ],
    icon: Hexagon,
  },

  {
    title: "Franchise",
    children: [
      {
        title: "Franchise Banners",
        url: "/admin/franchise/banners",
        icon: Store,
      },
      {
        title: "Franchise Form",
        url: "/admin/franchise/form",
        icon: Store,
      },
    ],
    icon: Store,
  },

  {
    title: "Gallery",
    children: [
      { title: "Image Upload", url: "/admin/gallery/image", icon: Image },
      { title: "Video Upload", url: "/admin/gallery/video", icon: Image },
      {
        title: "Social Media Links",
        url: "/admin/gallery/social-media",
        icon: Image,
      },
      {
        title: "Delivery Platform Links",
        url: "/admin/gallery/delivery-platform",
        icon: Image,
      },
    ],
    icon: Image,
  },

  {
    title: "Investor-Relation",
    children: [
      {
        title: "Investor Banners",
        url: "/admin/investor-relation/banners",
        icon: Handshake,
      },
      {
        title: "Corporate Information",
        url: "/admin/investor-relation/corporate-info",
        icon: Handshake,
      },
      {
        title: "Key Managerial Personnel",
        url: "/admin/investor-relation/key-managerial-personnel",
        icon: Handshake,
      },
      {
        title: "Annual Report",
        url: "/admin/investor-relation/annual-report",
        icon: Handshake,
      },
      {
        title: "Annual Returns",
        url: "/admin/investor-relation/annual-returns",
        icon: Handshake,
      },
      {
        title: "Financial Report",
        url: "/admin/investor-relation/financial-report",
        icon: Handshake,
      },
      {
        title: "Shareholder Report",
        url: "/admin/investor-relation/shareholder-report",
        icon: Handshake,
      },
      {
        title: "Corporate Governance",
        url: "/admin/investor-relation/governance",
        icon: Handshake,
      },
      {
        title: "Disclosure 46",
        url: "/admin/investor-relation/disclosure",
        icon: Handshake,
      },
      {
        title: "Disclosure - FSC",
        url: "/admin/disclosure-files/financials-subsidiary-companies",
        icon: Handshake,
      },
      {
        title: "Disclosure - SCR",
        url: "/admin/disclosure-files/secretarial-compliance-report",
        icon: Handshake,
      },
      {
        title: "Disclosure - R30",
        url: "/admin/disclosure-files/disclosure-r30",
        icon: Handshake,
      },
      {
        title: "Disclosure - Paper Advt",
        url: "/admin/disclosure-files/paper-adv",
        icon: Handshake,
      },
      {
        title: "Meetings",
        url: "/admin/investor-relation/meetings",
        icon: Handshake,
      },
      {
        title: "Policies",
        url: "/admin/investor-relation/policies",
        icon: Handshake,
      },
      {
        title: "Stock Exchange Filings",
        url: "/admin/investor-relation/stock-exchange",
        icon: Handshake,
      },
      {
        title: "Open Offer",
        url: "/admin/investor-relation/open-offer",
        icon: Handshake,
      },
      {
        title: "KYC Forms",
        url: "/admin/investor-relation/kyc-forms",
        icon: Handshake,
      },
      {
        title: "Scrutinizer Report",
        url: "/admin/investor-relation/scrutinizer",
        icon: Handshake,
      },
      {
        title: "Others",
        url: "/admin/investor-relation/others",
        icon: Handshake,
      },
      {
        title: "Live Stock Info",
        url: "/admin/investor-relation/live-stock",
        icon: Handshake,
      },
    ],
    icon: Handshake,
  },

  {
    title: "Contact",
    children: [
      {
        title: "Contact Banners",
        url: "/admin/contact/banners",
        icon: Mail,
      },
      { title: "Contact Form", url: "/admin/contact/form", icon: Mail },
    ],
    icon: Mail,
  },
];

const AppSidebar = ({ activeTitle, activeSubtitle }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login"); // ✅ redirect
  };
  return (
    <Sidebar>
      <SidebarHeader className={"bg-white border-b pb-3"}>
        <SidebarGroupLabel className="flex items-center justify-center text-xl text-gray-800 font-bold">
          Admin Panel
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className={"text-black bg-white"}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <Collapsible
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={
                            item.title == activeTitle
                              ? "border-l-4 border-gray-800 bg-gray-100"
                              : ""
                          }
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronUp className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-180 text-gray-600" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuButton
                                asChild
                                className={
                                  child.title == activeSubtitle
                                    ? "bg-gray-50"
                                    : ""
                                }
                              >
                                <Link href={child.url}>
                                  {/* <child.icon /> */}
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className={
                        item.title == activeTitle
                          ? "border-l-4 border-gray-800 bg-gray-100"
                          : ""
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={"bg-white border-t"}>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://github.com/shadcn.pngf" />
                    <AvatarFallback className="bg-gray-800 text-white">
                      {user.role?.charAt(0).toUpperCase() || "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) ||
                      "Role"}
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-60">
                <DropdownMenuItem>
                  <a href="/login" className="flex items-center gap-2 w-full">
                    <RefreshCcw />
                    <span>Switch Account</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <ShieldUser />
                    <span>
                      {user.role?.charAt(0).toUpperCase() +
                        user.role?.slice(1) || "Role"}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    className="flex items-center gap-2 w-full"
                    onClick={() => {
                      console.log("Logout clicked");
                      handleLogout();
                    }}
                  >
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
