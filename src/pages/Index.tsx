import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";

const Index = () => {
  // Sample news data - this would come from your backend once Supabase is connected
  const news = [
    {
      id: 1,
      title: "Nova praça será inaugurada no centro da cidade",
      content: "A prefeitura anunciou hoje a inauguração de uma nova praça no centro da cidade. O espaço contará com área de lazer, playground e área verde para a população. A obra, que custou R$ 2 milhões, será entregue no próximo mês. A expectativa é que o novo espaço se torne um ponto de encontro para famílias e contribua para a revitalização do centro.",
      date: "2024-02-20",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "Festival de Música acontece neste fim de semana",
      content: "O tradicional festival de música da cidade acontece neste fim de semana com diversas atrações locais e nacionais. O evento, que chega à sua 10ª edição, espera receber mais de 10 mil pessoas durante os dois dias de apresentações. Entre as atrações confirmadas estão bandas de rock, samba e MPB.",
      date: "2024-02-19",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Últimas Notícias</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              title={item.title}
              content={item.content}
              date={new Date(item.date).toLocaleDateString("pt-BR")}
              image={item.image}
              video={item.video}
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;