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

const AdminGalleryVideoUploadPage = () => {
  const [pageloading, setPageloading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [originalVideos, setOriginalVideos] = useState([]);
  const [changed, setChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    video: null,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    video: null,
  });

//   const fetchVideos = async () => {
//     const data = await fetch("http://localhost:4005/api/videos").then((res) =>
//       res.json()
//     )
//     console.log("video:",data)
//     const contactVideos = data
//       .filter((b) => b.page === "video")
//       .sort((a, b) => a.orderIndex - b.orderIndex);

//     setVideos(contactVideos);
//     setOriginalVideos(contactVideos);
//   };

const fetchVideos = async () => {
  try {
    const res = await fetch("http://localhost:4005/api/videos");

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    console.log("video:", data);

    const contactVideos = data
      .filter((v) => v.page === "video")
      .sort((a, b) => a.orderIndex - b.orderIndex);

    setVideos(contactVideos);
    setOriginalVideos(contactVideos);
  } catch (error) {
    console.error("Failed to fetch videos:", error);
  }
};

  useEffect(() => {
    const load = async () => {
      try {
        await fetchVideos();
      } finally {
        setPageloading(false);
      }
    };

    load();
  }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!addForm.title || !addForm.video) {
//       toast.error("Title and video are required");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("title", addForm.title);
//     formData.append("file", addForm.video);
//     formData.append("page", "video");

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:4005/api/videos", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`, // ✅ REQUIRED
//         },
//         body: formData, // ✅ FormData
//       })

//       if (!res.ok) throw new Error("Failed to add video");

//       document.getElementById("cancel-button").click();
//       fetchVideos();

//       toast.success("video added successfully");

//       // Reset form
//       setAddForm({ title: "", video: null });
//     } catch (error) {
//       toast.error("Error adding video");
//       console.error(error);
//     }
//   };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!addForm.title || !addForm.video) {
    toast.error("Title and video are required");
    return;
  }

  const formData = new FormData();
  formData.append("title", addForm.title);
  formData.append("file", addForm.video);
  formData.append("page", "video");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4005/api/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add video");
    }

    toast.success("Video added successfully");

    fetchVideos();
    setAddForm({ title: "", video: null });

  } catch (error) {
    toast.error(error.message);
    console.error("ADD VIDEO ERROR:", error);
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
    if (editForm.video) {
      formData.append("file", editForm.video);
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4005/api/videos/${editForm.id}`, // ✅ correct URL
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ONLY auth header
          },
          body: formData, // ✅ FormData
        }
      );

      if (!res.ok) throw new Error("Failed to update video");

      document.getElementById("cancel-button").click();
      fetchVideos();

      toast.success("video updated successfully");

      // Reset form
      setEditForm({ id: null, title: "", video: null });
    } catch (error) {
      toast.error("Error updating video");
      console.error(error);
    }
  };

  const handleDelete = async (galleryId) => {
    if (!confirm("Are you sure want to delete?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4005/api/videos/${galleryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      });

      if (!res.ok) throw new Error("Failed to delete video");

      fetchVideos();
      toast.success("video deleted successfully");
    } catch (error) {
      toast.error("Error deleting video");
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

    setVideos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);

      // detect change using id order
      const hasChanged = originalVideos.some(
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
      order: videos.map((b, index) => ({
        id: b.id,
        orderIndex: index + 1,
      })),
    };
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:4005/api/videos/reorder",
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

      // On success, update the originalVideos state to current order
      setOriginalVideos(videos);
      setChanged(false);
      toast.success("video order saved successfully.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to save video order.", {
        duration: 3000,
      });
    }
    setSaveLoading(false);
  };

  const toggleBanner = async (video) => {
    // Disable multiple clicks
    if (video.isUpdating) return;

    const newState = !video.isActive;

    // Optimistically update UI
    setVideos((prev) =>
      prev.map((b) =>
        b.id === video.id ? { ...b, isActive: newState, isUpdating: true } : b
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4005/api/videos/${video.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },

          body: JSON.stringify({ isActive: newState }),
        }
      );

      if (!res.ok) throw new Error("Failed to update video");

      toast.success(`video ${newState ? "enabled" : "disabled"}`, {
        duration: 3000,
      });

      // Clear the updating flag
      setVideos((prev) =>
        prev.map((b) => (b.id === video.id ? { ...b, isUpdating: false } : b))
      );
    } catch (error) {
      // Revert UI state on error
      setVideos((prev) =>
        prev.map((b) =>
          b.id === video.id
            ? { ...b, isActive: video.isActive, isUpdating: false }
            : b
        )
      );
      toast.error("Failed to update video", {
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
      <AppSidebar activeTitle="video" activeSubtitle="Contact videos" />
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
            <a href="/admin/gallery/video" className="text-black">
             Video
            </a>
          </span>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  className="hover:bg-gray-800 hover:text-white"
                >
                  Add video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New video</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter video title"
                      value={addForm.title}
                      onChange={(e) =>
                        setAddForm({ ...addForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="video">video</Label>
                    <Input
                      id="video"
                      name="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setAddForm({ ...addForm, video: e.target.files[0] })
                      }
                    />
                  </div>

                  {addForm.video && (
                    <div className="grid gap-3">
                      <label>Preview</label>
                      <img
                        className="px-1 mb-2 w-1/2"
                        src={URL.createObjectURL(addForm.video)}
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
            <TableCaption>List of gallery page videos.</TableCaption>
            <TableHeader className={"bg-gray-100"}>
              <TableRow className="hover:bg-gray-100 text-black">
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  #
                </TableHead>
                <TableHead className="hover:bg-gray-100 text-black text-center">
                  video
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
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <TableRow
                    key={video.id}
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
                            src={`http://localhost:4005${video.imageUrl}`}
                          />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Preview</DialogTitle>
                          </DialogHeader>
                          <img
                            className="w-full h-full rounded object-contain mx-auto"
                            alt="preview"
                            src={`http://localhost:4005${video.imageUrl}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-center">
                      {video.title}
                    </TableCell>

                    <TableCell className="text-center">
                      {/* <Switch
                      checked={video.isActive}
                      onCheckedChange={toggleBanner}
                    /> */}
                      <Switch
                        checked={video.isActive}
                        onCheckedChange={() => toggleBanner(video)}
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
                                id: video.id, // ✅ REQUIRED
                                title: video.title, // ✅ preload title
                                video: null, // optional new video
                              })
                            }
                          >
                            <SquarePen />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                          <DialogHeader>
                            <DialogTitle>Edit video</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                name="title"
                                placeholder="Enter video title"
                                value={editForm.title || video.title}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-3">
                              <Label htmlFor="video">video</Label>
                              <Input
                                id="video"
                                name="video"
                                type="file"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    video: e.target.files[0],
                                  })
                                }
                              />
                            </div>
                            {editForm.video && (
                              <div className="grid gap-3">
                                <label>Preview</label>
                                <img
                                  className="px-1 mb-2 w-1/2"
                                  src={URL.createObjectURL(editForm.video)}
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
                        onClick={() => handleDelete(video.id)}
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
                    No Videos found.
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

export default AdminGalleryVideoUploadPage;