import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Gavel, 
  Scroll, 
  Package, 
  UserCircle, 
  LogOut, 
  Settings, 
  Menu, 
  Calendar, 
  PieChart, 
  Wallet,
  Users,
  Mail,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  userRole: "farmer" | "trader";
}

const DashboardSidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("");
  const { profile, signOut } = useAuth();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const farmerMenuItems = [
    { title: "Dashboard", url: "/farmer-dashboard", icon: Home },
    { title: "My Products", url: "/farmer-products", icon: Package },
    { title: "My Auctions", url: "/farmer-auctions", icon: Gavel },
    { title: "Orders", url: "/farmer-orders", icon: ShoppingCart },
    { title: "Appointments", url: "/farmer-appointments", icon: Calendar },
  ];

  const traderMenuItems = [
    { title: "Dashboard", url: "/trader-dashboard", icon: Home },
    { title: "Market", url: "/trader-market", icon: Package },
    { title: "Auctions", url: "/trader-auctions", icon: Gavel },
    { title: "My Bids", url: "/trader-bids", icon: PieChart },
    { title: "Orders", url: "/trader-orders", icon: ShoppingCart },
    { title: "Appointments", url: "/trader-appointments", icon: Calendar },
  ];

  const menuItems = userRole === "farmer" ? farmerMenuItems : traderMenuItems;
  const roleClass = userRole === "farmer" ? "farmer-theme" : "trader-theme";
  const roleLabelColor = userRole === "farmer" ? "bg-agri-farmer/10 text-agri-farmer" : "bg-agri-trader/10 text-agri-trader";

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setOpenMobile(!openMobile)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <Sidebar 
        className={roleClass} 
        variant="sidebar" 
        collapsible="offcanvas"
      >
        <SidebarHeader className="flex p-4 items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Scroll className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AgriTradeConnect</span>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded ${roleLabelColor}`}>
            {userRole === "farmer" ? "Farmer" : "Trader"}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={activeItem === item.url}
                      onClick={() => {
                        navigate(item.url);
                        setActiveItem(item.url);
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => {
                      handleSignOut();
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      <span>Log out</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default DashboardSidebar;
