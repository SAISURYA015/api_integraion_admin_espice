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

const AdminBrandsBannersPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [originalBanners, setOriginalBanners] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    topBannerImageUrl: null,
    middleBannerImageUrl: null,
    bottomBannerImageUrl: null,
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

    // only send file if user selected a new one
    if (editForm.topBannerImageUrl) {
      formData.append("topBannerImage", editForm.topBannerImageUrl);
    }

    if (editForm.middleBannerImageUrl) {
      formData.append("middleBannerImage", editForm.middleBannerImageUrl);
    }

    if (editForm.bottomBannerImageUrl) {
      formData.append("bottomBannerImage", editForm.bottomBannerImageUrl);
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
      setEditForm({ id: null, name: "", topBannerImageUrl: null, middleBannerImageUrl: null, bottomBannerImageUrl: null});
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
              Banners
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
                  Top Banner Image
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Middle Banner Image
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Bottom Banner Image
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
                      <Dialog>
                        <DialogTrigger>
                          <img
                            className="w-12 h-12 rounded object-cover mx-auto hover:scale-105 transition-all duration-200"
                            alt="preview"
                            src={`http://localhost:4005${banner.topBannerImageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${banner.topBannerImageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger>
                          <img
                            className="w-12 h-12 rounded object-cover mx-auto hover:scale-105 transition-all duration-200"
                            alt="preview"
                            src={`http://localhost:4005${banner.middleBannerImageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${banner.middleBannerImageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger>
                          <img
                            className="w-12 h-12 rounded object-cover mx-auto hover:scale-105 transition-all duration-200"
                            alt="preview"
                            src={`http://localhost:4005${banner.bottomBannerImageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${banner.bottomBannerImageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
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
                                id: banner.id, // ✅ REQUIRED
                                name: banner.name, // ✅ preload title
                                topBannerImageUrl: null, // optional new image
                                middleBannerImageUrl: null, // optional new image
                                bottomBannerImageUrl: null, // optional new image
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
                                value={editForm.name || banner.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="image">Top Banner Image</Label>
                              <Input
                                id="topBannerImage"
                                name="topBannerImage"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    topBannerImageUrl: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            {editForm.topBannerImageUrl && (
                              <div className="grid gap-3">
                                <label>Preview</label>
                                <img
                                  className="px-1 mb-2 w-1/2"
                                  src={URL.createObjectURL(
                                    editForm.topBannerImageUrl,
                                  )}
                                  alt="Preview"
                                />
                              </div>
                            )}
                            <div className="grid gap-3">
                              <Label htmlFor="image">Middle Banner Image</Label>
                              <Input
                                id="middleBannerImage"
                                name="middleBannerImage"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    middleBannerImageUrl: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            {editForm.middleBannerImageUrl && (
                              <div className="grid gap-3">
                                <label>Preview</label>
                                <img
                                  className="px-1 mb-2 w-1/2"
                                  src={URL.createObjectURL(
                                    editForm.middleBannerImageUrl,
                                  )}
                                  alt="Preview"
                                />
                              </div>
                            )}
                            <div className="grid gap-3">
                              <Label htmlFor="image">Bottom Banner Image</Label>
                              <Input
                                id="bottomBannerImage"
                                name="bottomBannerImage"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    bottomBannerImageUrl: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            {editForm.bottomBannerImageUrl && (
                              <div className="grid gap-3">
                                <label>Preview</label>
                                <img
                                  className="px-1 mb-2 w-1/2"
                                  src={URL.createObjectURL(
                                    editForm.bottomBannerImageUrl,
                                  )}
                                  alt="Preview"
                                />
                              </div>
                            )}
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

export default AdminBrandsBannersPage;
