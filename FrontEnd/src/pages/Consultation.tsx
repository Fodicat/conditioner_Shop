import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { API_URL } from "@/config/appConfig";

const formSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  comments: z.string().optional(),
  type: z.string().optional(),
});

const ConsultationPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      comments: "",
      type: "consultation",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке заявки');
      }

      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast({
        title: "Ошибка!",
        description: "Не удалось отправить заявку. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 py-12 px-4">
      <Button
        variant="outline"
        className="absolute top-6 left-4 custom-button1 hidden lg:flex"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>
      <Card className="max-w-2xl mx-auto animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">Заказать консультацию</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FormLabel className="text-foreground">Ваше имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Иванов" {...field} className="bg-background text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <FormLabel className="text-foreground">Номер телефона *</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (999) 999-99-99" {...field} className="bg-background text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@mail.ru" {...field} className="bg-background text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <FormLabel className="text-foreground">Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите ваш проект или вопрос..."
                        className="min-h-[120px] bg-background text-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
                Отправить заявку
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationPage;
