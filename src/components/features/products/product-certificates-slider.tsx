"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ProductCertificate {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface ProductCertificatesSliderProps {
  certificates: ProductCertificate[];
}

export function ProductCertificatesSlider({ certificates }: ProductCertificatesSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (!certificates || certificates.length === 0) return null;

  const openModal = (index: number) => {
    setModalIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const navigateModal = (direction: "left" | "right") => {
    if (direction === "left") {
      setModalIndex((prev) => (prev === 0 ? certificates.length - 1 : prev - 1));
    } else {
      setModalIndex((prev) => (prev === certificates.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-[#f6a45d]" />
          <h2 className="text-lg font-bold text-[#0a0a0a]">Certificates</h2>
        </div>

        {/* Thumbnail Grid */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {certificates.map((cert, index) => (
            <button
              key={cert.id}
              onClick={() => openModal(index)}
              className={`flex-shrink-0 relative group rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                activeIndex === index
                  ? "border-[#f6a45d] shadow-lg"
                  : "border-[#d8a928]/20 hover:border-[#d8a928]/50"
              }`}
              style={{ width: "120px", height: "120px" }}
            >
              {cert.image ? (
                <Image
                  src={cert.image}
                  alt={cert.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#fcf5e8] flex items-center justify-center">
                  <Award className="h-8 w-8 text-[#d8a928]/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {/* Active Certificate Info */}
        <div className="mt-4 p-4 rounded-xl border border-[#d8a928]/20 bg-white">
          <h3 className="font-semibold text-[#0a0a0a] mb-2">{certificates[activeIndex].title}</h3>
          <p className="text-sm text-[#5A5E55] mb-3">{certificates[activeIndex].description}</p>
          <button
            onClick={() => openModal(activeIndex)}
            className="text-xs text-[#f6a45d] font-medium hover:underline flex items-center gap-1"
          >
            <ZoomIn className="h-3 w-3" />
            View Certificate
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 rounded-full bg-[#1a1308]/10 hover:bg-[#1a1308]/20 p-2 transition-colors"
            >
              <X className="h-5 w-5 text-[#0a0a0a]" />
            </button>

            {/* Navigation Buttons */}
            {certificates.length > 1 && (
              <>
                <button
                  onClick={() => navigateModal("left")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white border border-[#d8a928]/30 p-2 shadow-lg hover:bg-[#f6a45d] hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateModal("right")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white border border-[#d8a928]/30 p-2 shadow-lg hover:bg-[#f6a45d] hover:text-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Content */}
            <div className="text-center">
              {certificates[modalIndex].image && (
                <div className="relative w-full mb-6 rounded-xl overflow-hidden bg-[#fcf5e8]" style={{ height: "400px" }}>
                  <Image
                    src={certificates[modalIndex].image}
                    alt={certificates[modalIndex].title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">
                {certificates[modalIndex].title}
              </h2>
              <p className="text-sm text-[#5A5E55] max-w-md mx-auto">
                {certificates[modalIndex].description}
              </p>
              {certificates.length > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  {certificates.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setModalIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === modalIndex ? "bg-[#f6a45d] w-6" : "bg-[#d8a928]/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}