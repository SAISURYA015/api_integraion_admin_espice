"use client";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  return (
    <>
      <AppSidebar activeTitle="Dashboard" />
      <main className="w-full">
        <div className="Header w-full flex items-center justify-between px-4 py-2 lg:hidden">
          {/* <SidebarTrigger /> */}
        </div>
        <Tabs defaultValue="main" className="w-full px-4 py-2">
          <TabsList>
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="log">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <div className="">
              Welcome back{" "}
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                Card 1
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                Card 2
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                Card 3
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                Card 4
              </div>
            </div>
          </TabsContent>
          <TabsContent value="log">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Timestamp</th>
                    <th className="py-2 px-4 border-b">User</th>
                    <th className="py-2 px-4 border-b">Action</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  <tr>
                    <td className="py-2 px-4 border-b">2024-06-01 10:00:00</td>
                    <td className="py-2 px-4 border-b">admin</td>
                    <td className="py-2 px-4 border-b">Login</td>
                    <td className="py-2 px-4 border-b">Success</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">2024-06-01 10:05:00</td>
                    <td className="py-2 px-4 border-b">admin</td>
                    <td className="py-2 px-4 border-b">Viewed Dashboard</td>
                    <td className="py-2 px-4 border-b">Success</td>
                  </tr>
                  {/* More log entries can be added here */}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-4">
              <Tabs defaultValue="email" className="w-full">
                <TabsList>
                  <TabsTrigger value="email">Email Templates</TabsTrigger>
                  <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  {/* Email Templates */}
                  <section className="border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-2xl">
                      Email Templates
                    </h3>

                    <div className="lg:flex gap-4">
                      <div className="lg:w-1/3">
                        <label className="block mb-1 font-medium">
                          Selete email template
                        </label>
                        <select className="w-full border border-gray-300 p-2 rounded-lg mb-3">
                          <option>Contact Form</option>
                          <option>Franchise Form</option>
                        </select>
                      </div>

                      <div className="lg:w-2/3">
                        <label className="block mb-1 font-medium">
                          Email Content
                        </label>
                        <textarea
                          rows={5}
                          placeholder="Use variables like {{email}}, {{username}}, etc."
                          className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      {/* Save */}
                      <Button>Save Settings</Button>
                    </div>
                  </section>
                </TabsContent>
                <TabsContent value="backup">
                  {/* Backup & Restore */}
                  <section>
                    <h3 className="font-semibold mb-3">Backup & Restore</h3>

                    <div className="flex flex-wrap gap-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                        Download Backup (.zip)
                      </button>

                      <label className="border border-dashed border-gray-400 px-4 py-2 rounded-lg cursor-pointer">
                        Upload Backup (.zip)
                        <input type="file" accept=".zip" className="hidden" />
                      </label>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      Backup includes database and app settings.
                    </p>
                  </section>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default AdminDashboardPage;
