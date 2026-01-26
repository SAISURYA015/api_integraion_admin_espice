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

const AdminInvestorBannersPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [originalBanners, setOriginalBanners] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    image: null,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    image: null,
  });

  const fetchBanners = async () => {
    const data = await fetch("http://localhost:4005/api/banners").then((res) =>
      res.json()
    );

    const aboutBanners = data
      .filter((b) => b.page === "investor-relation")
      .sort((a, b) => a.orderIndex - b.orderIndex);

    setBanners(aboutBanners);
    setOriginalBanners(aboutBanners);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.title || !addForm.image) {
      toast.error("Title and Image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", addForm.title);
    formData.append("file", addForm.image);
    formData.append("page", "investor-relation");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4005/api/banners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: formData, // ✅ FormData
      });

      if (!res.ok) throw new Error("Failed to add banner");

      document.getElementById("cancel-button").click();
      fetchBanners();

      toast.success("Banner added successfully");

      // Reset form
      setAddForm({ title: "", image: null });
    } catch (error) {
      toast.error("Error adding banner");
      console.error(error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editForm.title) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", editForm.title);

    // only send file if user selected a new one
    if (editForm.image) {
      formData.append("file", editForm.image);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4005/api/banners/${editForm.id}`, // ✅ correct URL
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
      setEditForm({ id: null, title: "", image: null });
    } catch (error) {
      toast.error("Error updating banner");
      console.error(error);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/banners/${bannerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      });

      if (!res.ok) throw new Error("Failed to delete banner");

      fetchBanners();
      toast.success("Banner deleted successfully");
    } catch (error) {
      toast.error("Error deleting banner");
      console.error(error);
    }
  };

  const dragItemIndex = useRef(null);
  const dragOverIndex = useRef(null);

  const handleDragStart = (index) => {
    dragItemIndex.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverIndex.current = index;
  };

  const handleDragEnd = () => {
    const from = dragItemIndex.current;
    const to = dragOverIndex.current;

    if (from == null || to == null || from === to) return;

    setBanners((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);

      // detect change using id order
      const hasChanged = originalBanners.some(
        (b, i) => b.id !== updated[i]?.id
      );

      setChanged(hasChanged);
      return updated;
    });

    dragItemIndex.current = null;
    dragOverIndex.current = null;
  };

  const saveOrder = async () => {
    setSaveLoading(true);
    const payload = {
      order: banners.map((b, index) => ({
        id: b.id,
        orderIndex: index + 1,
      })),
    };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:4005/api/banners/reorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 500)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // On success, update the originalBanners state to current order
      setOriginalBanners(banners);
      setChanged(false);
      toast.success("Banner order saved successfully.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to save banner order.", {
        duration: 3000,
      });
    }
    setSaveLoading(false);
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
      const res = await fetch(
        `http://localhost:4005/api/banners/${banner.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },

          body: JSON.stringify({ isActive: newState }),
        }
      );

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
      <AppSidebar activeTitle="Investor Relation" activeSubtitle="Investor Banners" />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 border-b">
          {/* <SidebarTrigger /> */}
          <span className="flex gap-2 font-semibold text-gray-500">
            <a href="/admin" className="hover:text-black">
              Dashboard
            </a>
            <span>&gt;</span>
            <span className="hover:text-black">Investor Relation</span>
            <span>&gt;</span>
            <a href="/admin/investor-relation/banners" className="text-black">
              Banners
            </a>
          </span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hover:bg-gray-800 hover:text-white"
                >
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Banner</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter banner title"
                      value={addForm.title}
                      onChange={(e) =>
                        setAddForm({ ...addForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="image">Image</Label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setAddForm({ ...addForm, image: e.target.files[0] })
                      }
                    />
                  </div>

                  {addForm.image && (
                    <div className="grid gap-3">
                      <label>Preview</label>
                      <img
                        className="px-1 mb-2 w-1/2"
                        src={URL.createObjectURL(addForm.image)}
                        alt="Preview"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild id="cancel-button">
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit} type="submit">
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant={changed ? "default" : "outline"}
              onClick={changed ? saveOrder : undefined}
              className={
                changed
                  ? "hover:bg-gray-800 hover:text-white"
                  : "hover:bg-white"
              }
            >
              {saveLoading && <Spinner />}Save
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table className={"border"}>
            <TableCaption>List of about page banners.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  #
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Image
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Title
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
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className="hover:bg-muted select-none"
                  >
                    <TableCell className="w-10 text-center">
                      <span
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        className="cursor-grab inline-flex"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger>
                          <img
                            className="w-12 h-12 rounded object-cover mx-auto hover:scale-105 transition-all duration-200"
                            alt="preview"
                            src={`http://localhost:4005${banner.imageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${banner.imageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      {banner.title}
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
                                title: banner.title, // ✅ preload title
                                image: null, // optional new image
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit Banner</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                name="title"
                                placeholder="Enter banner title"
                                value={editForm.title || banner.title}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="image">Image</Label>
                              <Input
                                id="image"
                                name="image"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    image: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            {editForm.image && (
                              <div className="grid gap-3">
                                <label>Preview</label>
                                <img
                                  className="px-1 mb-2 w-1/2"
                                  src={URL.createObjectURL(editForm.image)}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(banner.id)}
                        className="hover:bg-gray-800 hover:text-white"
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No banners found.
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

export default AdminInvestorBannersPage;
