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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const AdminAboutLeadersPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const [originalLeaders, setOriginalLeaders] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    role: "",
    description: "",
    image: null,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    role: "",
    description: "",
    image: null,
  });

  const fetchLeaders = async () => {
    const data = await fetch("http://localhost:4005/api/leaders").then((res) =>
      res.json()
    );

    const aboutLeaders = data
      .filter((b) => b.page === "about")
      .sort((a, b) => a.orderIndex - b.orderIndex);

    setLeaders(aboutLeaders);
    setOriginalLeaders(aboutLeaders);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchLeaders();
      } finally {
        setPageloading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !addForm.name ||
      !addForm.role ||
      !addForm.description ||
      !addForm.image
    ) {
      toast.error("name, Role, Description and Image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("role", addForm.role);
    formData.append("description", addForm.description);
    formData.append("file", addForm.image);
    formData.append("page", "about");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4005/api/leaders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
        body: formData, // ✅ FormData
      });

      if (!res.ok) throw new Error("Failed to add leader");

      document.getElementById("cancel-button").click();
      fetchLeaders();

      toast.success("Leader added successfully");

      // Reset form
      setAddForm({ name: "", role: "", description: "", image: null });
    } catch (error) {
      toast.error("Error adding leader");
      console.error(error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (
      !editForm.name ||
      !editForm.role ||
      !editForm.description 
    ) {
      toast.error("Name, Role and Description are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("role", editForm.role);
    formData.append("description", editForm.description);

    // only send file if user selected a new one
    if (editForm.image) {
      formData.append("file", editForm.image);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4005/api/leaders/${editForm.id}`, // ✅ correct URL
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ONLY auth header
          },
          body: formData, // ✅ FormData
        }
      );

      if (!res.ok) throw new Error("Failed to update leader");

      document.getElementById("cancel-button").click();
      fetchLeaders();

      toast.success("Leader updated successfully");

      // Reset form
      setEditForm({ id: null, name: "", role: "", description: "", image: null });
    } catch (error) {
      toast.error("Error updating leader");
      console.error(error);
    }
  };

  const handleDelete = async (leaderId) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/leaders/${leaderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      });

      if (!res.ok) throw new Error("Failed to delete leader");

      fetchLeaders();
      toast.success("Leader deleted successfully");
    } catch (error) {
      toast.error("Error deleting leader");
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

    setLeaders((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);

      // detect change using id order
      const hasChanged = originalLeaders.some(
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
        "http://localhost:4005/api/leaders/reorder",
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

      // On success, update the originalLeaders state to current order
      setOriginalLeaders(leaders);
      setChanged(false);
      toast.success("Leader order saved successfully.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to save leader order.", {
        duration: 3000,
      });
    }
    setSaveLoading(false);
  };

  const toggleLeader = async (leader) => {
    // Disable multiple clicks
    if (leader.isUpdating) return;

    const newState = !leader.isActive;
    // Optimistically update UI
    setLeaders((prev) =>
      prev.map((l) =>
        l.id === leader.id ? { ...l, isActive: newState, isUpdating: true } : l
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4005/api/leaders/${leader.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },

          body: JSON.stringify({ isActive: newState }),
        }
      );

      if (!res.ok) throw new Error("Failed to update leader");

      toast.success(`Leader ${newState ? "enabled" : "disabled"}`, {
        duration: 3000,
      });

      // Clear the updating flag
      setLeaders((prev) =>
        prev.map((l) => (l.id === leader.id ? { ...l, isUpdating: false } : l))
      );
    } catch (error) {
      // Revert UI state on error
      setLeaders((prev) =>
        prev.map((l) =>
          l.id === leader.id
            ? { ...l, isActive: leader.isActive, isUpdating: false }
            : l
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
      <AppSidebar activeTitle="About" activeSubtitle="About Banners" />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 border-b">
          {/* <SidebarTrigger /> */}
          <span className="flex gap-2 font-semibold text-gray-500">
            <a href="/admin" className="hover:text-black">
              Dashboard
            </a>
            <span>&gt;</span>
            <span className="hover:text-black">About</span>
            <span>&gt;</span>
            <a href="/admin/about/leaders" className="text-black">
              Leaders
            </a>
          </span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hover:bg-gray-800 hover:text-white"
                >
                  Add Leader
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Leader</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter leader name"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                    />
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      placeholder="Enter role"
                      value={addForm.role}
                      onChange={(e) =>
                        setAddForm({ ...addForm, role: e.target.value })
                      }
                    />
                    <Label htmlFor="role">Description</Label>
                    <Textarea
                      placeholder="Type your message here."
                      id="description"
                      name="description"
                      value={addForm.description}
                      onChange={(e) =>
                        setAddForm({ ...addForm, description: e.target.value })
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
            <TableCaption>List of about page leaders.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  #
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Image
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Name
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Role
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Description
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
              {leaders.length > 0 ? (
                leaders.map((leader, index) => (
                  <TableRow
                    key={leader.id}
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
                            src={`http://localhost:4005${leader.imageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${leader.imageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">{leader.name}</TableCell>
                    <TableCell className="text-center">{leader.role}</TableCell>
                    <TableCell className="text-center">
                      {leader.description}
                    </TableCell>

                    <TableCell className="text-center">
                      {/* <Switch
                      checked={banner.isActive}
                      onCheckedChange={toggleBanner}
                    /> */}
                      <Switch
                        checked={leader.isActive}
                        onCheckedChange={() => toggleLeader(leader)}
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
                                id: leader.id, // ✅ REQUIRED
                                name: leader.name, // ✅ preload name
                                role: leader.role, // ✅ preload role
                                description: leader.description, // ✅ preload description
                                image: null, // optional new image
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit Leader</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                placeholder="Enter leader name"
                                value={editForm.name || leader.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="name">Role</Label>
                              <Input
                                id="role"
                                name="role"
                                placeholder="Enter leader role"
                                value={editForm.role || leader.role}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    role: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                placeholder="Type your message here."
                                id="description"
                                name="description"
                                value={
                                  editForm.description || leader.description
                                }
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
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
                        onClick={() => handleDelete(leader.id)}
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
                    No Leaders found.
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

export default AdminAboutLeadersPage;
