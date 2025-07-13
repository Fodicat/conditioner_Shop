import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/additionally.css";
import photo1 from "@/assets/photos/photo1.jpg";
import photo2 from "@/assets/photos/photo2.jpg";
import photo3 from "@/assets/photos/photo3.jpg";
import photo4 from "@/assets/photos/photo4.jpg";
import photo5 from "@/assets/photos/photo5.jpg";
import photo6 from "@/assets/photos/photo6.jpg";
import photo7 from "@/assets/photos/photo7.jpg";
import photo8 from "@/assets/photos/photo8.jpg";
import photo9 from "@/assets/photos/photo9.jpg";

const photos = [
  photo1,
  photo2,
  photo3,
  photo4,
  photo5,
  photo6,
  photo7,
  photo8,
  photo9,
];

const Gallery = () => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Состояние для выбранной фотографии

  const closeFullscreen = () => setSelectedPhoto(null); // Закрыть полноэкранный режим

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-8">
      <Button
        variant="outline"
        className="absolute top-4 left-4 custom-button1 hidden lg:flex"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground animate-fade-in">
          Наши проекты
        </h1>
        <p
          className="text-xl text-muted-foreground text-center mb-12 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          В этом разделе представлены фотографии наших выполненных работ по
          установке и обслуживанию систем кондиционирования
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="aspect-square bg-card rounded-lg overflow-hidden animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedPhoto(photo)} // Установить выбранное фото
            >
              <img
                src={photo}
                alt={`Фото ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Полноэкранный просмотр */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeFullscreen} // Закрыть при клике вне фото
        >
          <div className="relative">
            <img
              src={selectedPhoto}
              alt="Полноэкранное фото"
              className="max-w-full max-h-screen rounded-lg"
            />
            <button
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2 shadow-md"
              onClick={(e) => {
                e.stopPropagation(); // Предотвращает закрытие при клике на кнопку
                closeFullscreen();
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
