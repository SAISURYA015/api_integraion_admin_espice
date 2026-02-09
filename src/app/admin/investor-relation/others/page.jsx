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

const AdminOthersPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    file: null,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    file: null, 
  });

  const fetchOthers = async () => {
    const data = await fetch("http://localhost:4005/api/others").then((res) =>
      res.json()
    );

    const others = data
      // .filter((b) => b.page === "investor-relation")
      .sort((a, b) => a.orderIndex - b.orderIndex);

    setItems(others);
    setOriginalItems([...others]);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchOthers();
      } finally {
        setPageloading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.title || !addForm.file) {
      toast.error("Title and File are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", addForm.title);
    formData.append("file", addForm.file);
    // formData.append("page", "investor-relation");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token missing. Please login again.");
        return;
      }

      const res = await fetch("http://localhost:4005/api/others", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: formData, // ✅ FormData
      });

      if (!res.ok) throw new Error("Failed to add file");

      document.getElementById("cancel-button").click();
      fetchOthers();

      toast.success("File added successfully");

      // Reset form
      setAddForm({ title: "", file: null });
    } catch (error) {
      toast.error("Error adding file");
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
    if (editForm.file) {
      formData.append("file", editForm.file);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4005/api/others/${editForm.id}`, // ✅ correct URL
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ONLY auth header
          },
          body: formData, // ✅ FormData
        }
      );

      if (!res.ok) throw new Error("Failed to update file");

      document.getElementById("cancel-button").click();
      fetchOthers();

      toast.success("File updated successfully");

      // Reset form
      setEditForm({ id: null, title: "", file: null });
    } catch (error) {
      toast.error("Error updating file");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/others/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      });

      if (!res.ok) throw new Error("Failed to delete file");

      fetchOthers();
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Error deleting file");
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

    setItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);

      // detect change using id order
      const hasChanged = originalItems.some(
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
      order: items.map((b, index) => ({
        id: b.id,
        orderIndex: index + 1,
      })),
    };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:4005/api/others/reorder",
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

      // On success, update the originalItems state to current order
      setOriginalItems(items);
      setChanged(false);
      toast.success("File order saved successfully.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to save file order.", {
        duration: 3000,
      });
    }
    setSaveLoading(false);
  };

  const toggleFile = async (item) => {
    // Disable multiple clicks
    if (item.isUpdating) return;

    const newState = !item.isActive;

    // Optimistically update UI
    setItems((prev) =>
      prev.map((b) =>
        b.id === item.id ? { ...b, isActive: newState, isUpdating: true } : b
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4005/api/others/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },

          body: JSON.stringify({ isActive: newState }),
        }
      );

      if (!res.ok) throw new Error("Failed to update file");

      toast.success(`File ${newState ? "enabled" : "disabled"}`, {
        duration: 3000,
      });

      // Clear the updating flag
      setItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isUpdating: false } : b))
      );
    } catch (error) {
      // Revert UI state on error
      setItems((prev) =>
        prev.map((b) =>
          b.id === item.id
            ? { ...b, isActive: item.isActive, isUpdating: false }
            : b
        )
      );
      toast.error("Failed to update file", {
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
      <AppSidebar activeTitle="Others" activeSubtitle="Others Files" />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 border-b">
          {/* <SidebarTrigger /> */}
          <span className="flex gap-2 font-semibold text-gray-500">
            <a href="/admin" className="hover:text-black">
              Dashboard
            </a>
            <span>&gt;</span>
            <span className="hover:text-black">Investor-relation</span>
            <span>&gt;</span>
            <a href="/admin/investor-relation/others" className="text-black">
              Others
            </a>
          </span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hover:bg-gray-800 hover:text-white"
                >
                  Add File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter file title"
                      value={addForm.title}
                      onChange={(e) =>
                        setAddForm({ ...addForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setAddForm({ ...addForm, file: e.target.files[0] })
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
            <TableCaption>List of other page files.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  #
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  Title
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  File
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
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow
                    key={item.id}
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
                      {item.title}
                    </TableCell>
                    {/* <TableCell>
                      <img
                        src={`http://localhost:4005/uploads/${item.file}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell> */}
                    <TableCell className="text-center">
                      <a
                        href={`http://localhost:4005/uploads/${item.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.file}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => toggleFile(item)}
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
                                id: item.id, // ✅ REQUIRED
                                title: item.title, // ✅ preload title
                                file: null, // optional new file
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit File</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                name="title"
                                placeholder="Enter file title"
                                value={editForm.title || item.title}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="file">File</Label>
                              <Input
                                id="file"
                                name="file"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    file: e.target.files[0],
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
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
                    No Files found.
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

export default AdminOthersPage;