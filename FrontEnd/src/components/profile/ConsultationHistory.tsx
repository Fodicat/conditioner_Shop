import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/appConfig";

interface Consultation {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  description: string;
  status: string;
  created_at: string;
}

export function ConsultationHistory() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${API_URL}/api/notifications/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setConsultations(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке консультаций:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-center">Загрузка истории консультаций...</div>;
  }

  if (consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Заявки на консультацию
          </CardTitle>
          <CardDescription>У вас пока нет заявок на консультацию</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <p className="mb-4">Ваши заявки на консультацию будут отображаться здесь</p>
          <Button onClick={() => navigate("/consultation")}>Заказать консультацию</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Заявки на консультацию
        </CardTitle>
        <CardDescription>История ваших заявок на консультацию</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№ заявки</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Описание</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell>№{consultation.id}</TableCell>
                <TableCell>{new Date(consultation.created_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    consultation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {consultation.status === 'completed' ? 'Обработана' :
                     consultation.status === 'processing' ? 'В обработке' :
                     consultation.status === 'cancelled' ? 'Отменена' : 'Новая'}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {consultation.description || "Нет описания"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
