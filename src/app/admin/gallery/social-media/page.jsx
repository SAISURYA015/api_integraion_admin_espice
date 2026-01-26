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

const AdminGallerySocialMediaLinksPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [originalBrands, setOriginalBrands] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    facebook: "",
    youtube: "",
    google: "",
    instagram: "",
  });

  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    facebook: "",
    youtube: "",
    google: "",
    instagram: "",
  });

  const fetchBrands = async () => {
    const data = await fetch("http://localhost:4005/api/brands").then((res) =>
      res.json()
    );
    if (!Array.isArray(data)) {
      console.error("Brands API error:", data);
      setBrands([]);
      return;
    }
    const gallerySocialMediaLinks = data
      .filter((b) => b.page === "brands")
      .sort((a, b) => a.orderIndex - b.orderIndex);

    setBrands(gallerySocialMediaLinks);
    setOriginalBrands(gallerySocialMediaLinks);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBrands();
      } finally {
        setPageloading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.name) {
      toast.error("Brand name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("facebook", addForm.facebook);
    formData.append("youtube", addForm.youtube);
    formData.append("google", addForm.google);
    formData.append("instagram", addForm.instagram);
    formData.append("page", "brands");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4005/api/brands", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: formData, // ✅ FormData
      });

      if (!res.ok) throw new Error("Failed to add brand");

      document.getElementById("cancel-button").click();
      fetchBrands();

      toast.success("brand added successfully");

      // Reset form
      setAddForm({
        name: "",
        facebook: "",
        youtube: "",
        google: "",
        instagram: "",
      });
    } catch (error) {
      toast.error("Error adding brand");
      console.error(error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editForm.name) {
      toast.error("TName is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("facebook", editForm.facebook);
    formData.append("youtube", editForm.youtube);
    formData.append("google", editForm.google);
    formData.append("instagram", editForm.instagram);
    formData.append("page", "brands");

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

      if (!res.ok) throw new Error("Failed to update brand");

      document.getElementById("cancel-button").click();
      fetchBrands();

      toast.success("brand updated successfully");

      // Reset form
      setEditForm({
        name: "",
        facebook: "",
        youtube: "",
        google: "",
        instagram: "",
      });
    } catch (error) {
      toast.error("Error updating brand");
      console.error(error);
    }
  };
  // const handleEdit = async (e) => {
  //     e.preventDefault();

  //     if (!editForm.name) {
  //       toast.error("Name is required");
  //       return;
  //     }

  //     try {
  //       const token = localStorage.getItem("token");

  //       const res = await fetch(
  //         `http://localhost:4005/api/brands/${editForm.id}`, // ✅ Brand API
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`, // ✅ auth only
  //           },
  //           body: JSON.stringify({
  //             name: editForm.name,
  //             facebook: editForm.facebook || null,
  //             youtube: editForm.youtube || null,
  //             google: editForm.google || null,
  //             instagram: editForm.instagram || null,
  //             page:"brands",
  //           }),
  //         }
  //       );

  //       if (!res.ok) throw new Error("Failed to update brand links");

  //       document.getElementById("cancel-button")?.click();
  //       fetchBrands();

  //       toast.success("Social links updated successfully");

  //       // Reset form
  //       setEditForm({
  //         id: null,
  //         name: "",
  //         facebook: "",
  //         youtube: "",
  //         google: "",
  //         instagram: "",
  //       });
  //     } catch (error) {
  //       toast.error("Error updating delivery links");
  //       console.error(error);
  //     }
  //   };

  const handleDelete = async (brandId) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/brands/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      });

      if (!res.ok) throw new Error("Failed to delete brand");

      fetchBrands();
      toast.success("brand deleted successfully");
    } catch (error) {
      toast.error("Error deleting brand");
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

    setBrands((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);

      // detect change using id order
      const hasChanged = originalBrands.some((b, i) => b.id !== updated[i]?.id);

      setChanged(hasChanged);
      return updated;
    });

    dragItemIndex.current = null;
    dragOverIndex.current = null;
  };

  const saveOrder = async () => {
    setSaveLoading(true);
    const payload = {
      order: brands.map((b, index) => ({
        id: b.id,
        orderIndex: index + 1,
      })),
    };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:4005/api/brands/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 500)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // On success, update the originalBrands state to current order
      setOriginalBrands(brands);
      setChanged(false);
      toast.success("brand order saved successfully.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to save brand order.", {
        duration: 3000,
      });
    }
    setSaveLoading(false);
  };

  const toggleBrand = async (brand) => {
    // Disable multiple clicks
    if (brand.isUpdating) return;

    const newState = !brand.isActive;

    // Optimistically update UI
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brand.id ? { ...b, isActive: newState, isUpdating: true } : b
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/brands/${brand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },

        body: JSON.stringify({ isActive: newState }),
      });

      if (!res.ok) throw new Error("Failed to update brand");

      toast.success(`brand ${newState ? "enabled" : "disabled"}`, {
        duration: 3000,
      });

      // Clear the updating flag
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, isUpdating: false } : b))
      );
    } catch (error) {
      // Revert UI state on error
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brand.id
            ? { ...b, isActive: brand.isActive, isUpdating: false }
            : b
        )
      );
      toast.error("Failed to update brand", {
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
      <AppSidebar
        activeTitle="Gallery"
        activeSubtitle="Gallery SocialMediaLinks"
      />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 border-b">
          {/* <SidebarTrigger /> */}
          <span className="flex gap-2 font-semibold text-gray-500">
            <a href="/admin" className="hover:text-black">
              Dashboard
            </a>
            <span>&gt;</span>
            <span className="hover:text-black">Gallery</span>
            <span>&gt;</span>
            <a href="/admin/gallery/social-media" className="text-black">
              Socoal Media Links
            </a>
          </span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hover:bg-gray-800 hover:text-white"
                >
                  Add Brand Links
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Brand Links</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Brand Name</Label>
                    <Input
                      placeholder="Enter brand name"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Facebook</Label>
                    <Input
                      placeholder="Facebook link"
                      value={addForm.facebook}
                      onChange={(e) =>
                        setAddForm({ ...addForm, facebook: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>YouTube</Label>
                    <Input
                      placeholder="YouTube link"
                      value={addForm.youtube}
                      onChange={(e) =>
                        setAddForm({ ...addForm, youtube: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Google</Label>
                    <Input
                      placeholder="Google link"
                      value={addForm.google}
                      onChange={(e) =>
                        setAddForm({ ...addForm, google: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Instagram</Label>
                    <Input
                      placeholder="Instagram link"
                      value={addForm.instagram}
                      onChange={(e) =>
                        setAddForm({ ...addForm, instagram: e.target.value })
                      }
                    />
                  </div>
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
            <TableCaption>List of about page brands.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  #
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Brand Name
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Active
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Facebook
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Youtube
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Google
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Instgrm
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
              {brands.length > 0 ? (
                brands.map((brand, index) => (
                  <TableRow
                    key={brand.id}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className="hover:bg-muted select-none"
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>

                    <TableCell className="text-center">{brand.name}</TableCell>

                    <TableCell className="text-center">
                      <Switch
                        checked={brand.isActive}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                    </TableCell>

                    <TableCell className="text-center">
                      {brand.facebook ? (
                        <a
                          href={brand.facebook}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      ) : (
                        "NA"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {brand.youtube ? (
                        <a
                          href={brand.youtube}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      ) : (
                        "NA"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {brand.google ? (
                        <a
                          href={brand.google}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      ) : (
                        "NA"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {brand.instagram ? (
                        <a
                          href={brand.instagram}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Open
                        </a>
                      ) : (
                        "NA"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-center">
                      {new Date(brand.updatedAt).toLocaleDateString()}
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
                                id: brand.id,
                                name: brand.name,
                                facebook: brand.facebook || "",
                                youtube: brand.youtube || "",
                                google: brand.google || "",
                                instagram: brand.instagram || "",
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit brand</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label>Name</Label>
                              <Input
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Brand name"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Facebook</Label>
                              <Input
                                value={editForm.facebook}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    facebook: e.target.value,
                                  })
                                }
                                placeholder="Facebook link"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>YouTube</Label>
                              <Input
                                value={editForm.youtube}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    youtube: e.target.value,
                                  })
                                }
                                placeholder="YouTube link"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Google</Label>
                              <Input
                                value={editForm.google}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    google: e.target.value,
                                  })
                                }
                                placeholder="Google link"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Instagram</Label>
                              <Input
                                value={editForm.instagram}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    instagram: e.target.value,
                                  })
                                }
                                placeholder="Instagram link"
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(brand.id)}
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
                    No brands found.
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

export default AdminGallerySocialMediaLinksPage;
