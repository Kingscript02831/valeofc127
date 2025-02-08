
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  image?: string;
  images?: string[];
  location?: string;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  const [eventTime, setEventTime] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Admin - Eventos | Vale Notícias";
  }, []);

  const { data: events, refetch } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !eventDate || !eventTime) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { error } = await supabase.from("events").insert({
        title,
        description,
        location,
        event_date: eventDate.toISOString(),
        event_time: eventTime,
        image,
        images,
      });

      if (error) throw error;

      toast.success("Evento criado com sucesso!");
      refetch();
      
      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate(new Date());
      setEventTime("");
      setImage(undefined);
      setImages([]);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erro ao criar evento");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      toast.success("Evento excluído com sucesso!");
      refetch();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin - Eventos</h1>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Voltar
            </Button>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do evento"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição do evento"
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Digite a localização do evento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data do Evento</Label>
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image">URL da Imagem Principal</Label>
              <Input
                id="image"
                value={image || ""}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Cole a URL da imagem principal"
              />
            </div>

            <Button type="submit" className="w-full">
              Criar Evento
            </Button>
          </form>
        </div>

        <Separator className="my-8" />

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Eventos Cadastrados</h2>
          <div className="space-y-4">
            {events?.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.event_date), "dd/MM/yyyy")} às{" "}
                    {event.event_time}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(event.id)}
                >
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
