
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminNotifications from "@/pages/AdminNotifications";
import AdminPanel from "@/pages/AdminPanel";
import { User } from "@/contexts/AuthContext";

interface AdminSectionProps {
  user: User | null;
}

export const AdminSection = ({ user }: AdminSectionProps) => {
  const navigate = useNavigate();

  if (!user?.isAdmin) return null;

  return (
    <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2">
      <AdminNotifications />
      <AdminPanel />
      <Button 
        variant="outline" 
        className="flex items-center gap-2 custom-button1 animate-fade-in"
        onClick={() => navigate('/shop')}
      >
        <Cog className="h-4 w-4" />
        <span className="hidden sm:inline">Управление товарами</span>
      </Button>
    </div>
  );
};
