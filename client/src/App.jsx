import { LayoutDashboard, StickyNote, Layers, Flag, Calendar, LifeBuoy, Settings } from "lucide-react";
import { useState } from "react";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import CameraDetails from "./components/CameraDetails";
import AlertsLogs from "./components/AlertsLogs";
import SaveRecording from "./components/SaveRecording";
import Reporting from "./components/Reporting";
import SettingsPage from "./components/SettingsPage";
import Help from "./components/Help";

function App() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [selectedCameraId, setSelectedCameraId] = useState(null);

  // Function to navigate to camera details
  const handleNavigateToCameraDetails = (cameraId) => {
    setSelectedCameraId(cameraId);
    setActiveMenu("CameraDetails");
  };

  // Function to go back to dashboard
  const handleBackToDashboard = () => {
    setActiveMenu("Dashboard");
    setSelectedCameraId(null);
  };

  // Function to render the active component
  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <Dashboard onNavigateToCameraDetails={handleNavigateToCameraDetails} />;
      case "Analytics":
        return <Analytics />;
      case "CameraDetails":
        return <CameraDetails cameraId={selectedCameraId} onBack={handleBackToDashboard} />;
      case "Alert & Logs":
        return <AlertsLogs />;
      case "Save Recording":
        return <SaveRecording />;
      case "Reporting":
        return <Reporting />;
      case "Settings":
        return <SettingsPage />;
      case "Help":
        return <Help />;
      default:
        return <Dashboard onNavigateToCameraDetails={handleNavigateToCameraDetails} />;
    }
  };

  return (
    <>
      <div className="flex">
        <Sidebar>
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            text="Dashboard" 
            active={activeMenu === "Dashboard"}
            onClick={() => setActiveMenu("Dashboard")}
            alert 
          />
          <SidebarItem 
            icon={<StickyNote size={20} />} 
            text="Analytics" 
            active={activeMenu === "Analytics"}
            onClick={() => setActiveMenu("Analytics")}
            alert 
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            text="Alert & Logs" 
            active={activeMenu === "Alert & Logs"}
            onClick={() => setActiveMenu("Alert & Logs")}
          />
          <SidebarItem 
            icon={<Layers size={20} />} 
            text="Save Recording" 
            active={activeMenu === "Save Recording"}
            onClick={() => setActiveMenu("Save Recording")}
          />
          <SidebarItem 
            icon={<Flag size={20} />} 
            text="Reporting" 
            active={activeMenu === "Reporting"}
            onClick={() => setActiveMenu("Reporting")}
          />
          <hr className="my-3 border-gray-300" />
          <SidebarItem 
            icon={<Settings size={20} />} 
            text="Settings" 
            active={activeMenu === "Settings"}
            onClick={() => setActiveMenu("Settings")}
          />
          <SidebarItem 
            icon={<LifeBuoy size={20} />} 
            text="Help" 
            active={activeMenu === "Help"}
            onClick={() => setActiveMenu("Help")}
          />
        </Sidebar>
        
        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-gray-100 min-h-screen">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;// Test deployment
