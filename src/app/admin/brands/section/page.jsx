"use client";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquarePen, Trash, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const AdminBrandsSectionsPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [originalBanners, setOriginalBanners] = useState([]);

  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    aboutTitle: "",
    aboutDescription: "",
    destinationTagline: "",
    websiteLink: "",
  });

  const fetchBanners = async () => {
    const data = await fetch(`http://localhost:4005/api/brands`).then((res) =>
      res.json()
    );

    console.log(data, "data")
    // const homeBanners = data.filter((b) => {
    //   return b.page === "brand";
    // });

    const homeBanners = data;

    setBanners(homeBanners);
    setOriginalBanners(homeBanners);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBanners();
      } finally {
        setPageloading(false);
      }
    };

    load();
  }, []);

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editForm.name) {
      toast.error("name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("aboutTitle", editForm.aboutTitle);
    formData.append("aboutDescription", editForm.aboutDescription);
    formData.append("destinationTagline", editForm.destinationTagline);
    formData.append("websiteLink", editForm.websiteLink);

    // only send file if user selected a new one
    if (editForm.topBannerImageUrl) {
      formData.append("topBannerImage", editForm.topBannerImageUrl);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4005/api/brands/${editForm.id}`, // ✅ correct URL
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ONLY auth header
          },
          body: formData, // ✅ FormData
        }
      );

      if (!res.ok) throw new Error("Failed to update banner");

      document.getElementById("cancel-button").click();
      fetchBanners();

      toast.success("Banner updated successfully");

      // Reset form
      setEditForm({ id: null, name: "", aboutTitle: "", aboutDescription: "", destinationTagline: "", websiteLink: "" });
    } catch (error) {
      toast.error("Error updating banner");
      console.error(error);
    }
  };

  

  const toggleBanner = async (banner) => {
    // Disable multiple clicks
    if (banner.isUpdating) return;

    const newState = !banner.isActive;

    // Optimistically update UI
    setBanners((prev) =>
      prev.map((b) =>
        b.id === banner.id ? { ...b, isActive: newState, isUpdating: true } : b
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/brands/${banner.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },

        body: JSON.stringify({ isActive: newState }),
      });

      if (!res.ok) throw new Error("Failed to update banner");

      toast.success(`Banner ${newState ? "enabled" : "disabled"}`, {
        duration: 3000,
      });

      // Clear the updating flag
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isUpdating: false } : b))
      );
    } catch (error) {
      // Revert UI state on error
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id
            ? { ...b, isActive: banner.isActive, isUpdating: false }
            : b
        )
      );
      toast.error("Failed to update banner", {
        duration: 3000,
      });
    }
  };

  if (pageloading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen w-screen">
          <Spinner className="w-16 h-16" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppSidebar activeTitle="Brands" activeSubtitle="Brand Logo" />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 border-b">
          {/* <SidebarTrigger /> */}
          <span className="flex gap-2 font-semibold text-gray-500">
            <a href="/admin" className="hover:text-black">
              Dashboard
            </a>
            <span>&gt;</span>
            <span className="hover:text-black">Brands</span>
            <span>&gt;</span>
            <a href="/admin/home/banners" className="text-black">
              Sections
            </a>
          </span>
        </div>
        <div className="p-4">
          <Table className={"border"}>
            <TableCaption>List of brand page banners.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  S. No.
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Name
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  About-Title
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  About-Description
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Destination-Tagline
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Website Link
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Active
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Created_At
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Updated_At
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {banners.length > 0 ? (
                banners.map((banner, index) => (
                  <TableRow
                    key={banner.id}
                    
                    className="hover:bg-muted select-none"
                  >
                    <TableCell className="w-10 text-center">
                     {index + 1}
                    </TableCell>

                    <TableCell className="text-center">{banner.name}</TableCell>
                    <TableCell className="text-center">
                      {banner.aboutTitle}
                    </TableCell>
                    <TableCell className="text-center">
                      {banner.aboutDescription}
                    </TableCell>
                    <TableCell className="text-center">
                      {banner.destinationTagline}
                    </TableCell>
                    <TableCell className="text-center">
                      {banner.websiteLink ? (
                        <a
                          href={banner.websiteLink}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          {banner.websiteLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {/* <Switch
                      checked={banner.isActive}
                      onCheckedChange={toggleBanner}
                    /> */}
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => toggleBanner(banner)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      2025-09-13 17:45:37.937Z
                    </TableCell>
                    <TableCell className="text-center">
                      2025-09-13 17:45:37.937Z
                    </TableCell>

                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2 hover:bg-gray-800 hover:text-white"
                            onClick={() =>
                              setEditForm({
                                id: banner.id,
                                name: banner.name,
                                aboutTitle: banner.aboutTitle || "",
                                aboutDescription: banner.aboutDescription || "",
                                destinationTagline:
                                banner.destinationTagline || "",
                                websiteLink: banner.websiteLink || "",
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit Brand</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Enter banner name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="aboutTitle">About-Title</Label>
                              <Input
                                id="aboutTitle"
                                name="aboutTitle"
                                placeholder="Enter about title"
                                value={editForm.aboutTitle}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    aboutTitle: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="aboutDescription">
                                About-Description
                              </Label>
                              <Input
                                id="aboutDescription"
                                name="aboutDescription"
                                placeholder="Enter about description"
                                value={
                                  editForm.aboutDescription ||
                                  banner.aboutDescription
                                }
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    aboutDescription: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="destinationTagline">
                                Destination-tagline
                              </Label>
                              <Input
                                id="destinationTagline"
                                name="destinationTagline"
                                placeholder="Enter destination tagline"
                                value={
                                  editForm.destinationTagline ||
                                  banner.destinationTagline
                                }
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    destinationTagline: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="destinationTagline">
                                Website Link
                              </Label>
                              <Input
                                id="websiteLink"
                                name="websiteLink"
                                placeholder="Enter website link"
                                value={
                                  editForm.websiteLink || banner.websiteLink
                                }
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    websiteLink: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild id="cancel-button">
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleEdit}>
                              Save changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No brand banners found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
};

export default AdminBrandsSectionsPage;
