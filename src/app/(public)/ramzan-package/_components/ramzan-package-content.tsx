import React from "react";

interface PackageItem {
  name: string;
  weight: string;
  openMarket: number;
  discount: number;
}

export function RamzanPackageContent() {
  const packageData: PackageItem[] = [
    { name: "Rice", weight: "2.00 kg", openMarket: 720, discount: 660 },
    { name: "Suger", weight: "2.00 kg", openMarket: 360, discount: 300 },
    { name: "Ghee", weight: "2.00 kg", openMarket: 810, discount: 770 },
    { name: "Baisen", weight: "1.00 kg", openMarket: 300, discount: 250 },
    { name: "Dal", weight: "1.00 kg", openMarket: 300, discount: 260 },
    { name: "Tea", weight: "500 grm", openMarket: 650, discount: 500 },
    { name: "Masala", weight: "250 grm", openMarket: 270, discount: 180 },
    { name: "Khajur", weight: "1.00 kg", openMarket: 500, discount: 440 },
    { name: "Roh e Afza", weight: "800ml Bottle", openMarket: 500, discount: 460 },
    { name: "Laptops", weight: "3 Packs", openMarket: 300, discount: 190 },
  ];

  const totalMarket = 4710;
  const totalDiscounted = 4010;
  const savings = totalMarket - totalDiscounted;

  return (
    <div className="flex min-h-screen justify-center bg-[#fcf5e8] px-4 py-10">
      <div className="w-full max-w-2xl border-4 border-[#1E1F1C] bg-white p-6 shadow-2xl md:p-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-[#0a0a0a] md:text-6xl">
            سستا اور معیاری پیکیج
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-1 w-12 bg-[#d8a928] md:w-20" />
            <h2 className="whitespace-nowrap text-2xl font-bold text-[#f6a45d] md:text-3xl">
              برائے رمضان کریم
            </h2>
            <div className="h-1 w-12 bg-[#d8a928] md:w-20" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-[#1E1F1C] text-center font-bold">
            <thead>
              <tr className="bg-[#fcf5e8] text-[#0a0a0a]">
                <th className="border-2 border-[#1E1F1C] p-2 text-sm md:text-base">Items Name</th>
                <th className="border-2 border-[#1E1F1C] p-2 text-sm md:text-base">Weight / Pack</th>
                <th className="border-2 border-[#1E1F1C] p-2 text-sm md:text-base">Open Market</th>
                <th className="border-2 border-[#1E1F1C] bg-[#f6a45d] p-2 text-sm text-white md:text-base">
                  Discount Price
                </th>
              </tr>
            </thead>
            <tbody>
              {packageData.map((item, index) => (
                <tr key={`${item.name}-${index}`} className="transition-colors hover:bg-[#fcf5e8]">
                  <td className="border-2 border-[#1E1F1C] p-2 text-sm text-[#0a0a0a] md:text-base">{item.name}</td>
                  <td className="border-2 border-[#1E1F1C] p-2 text-sm text-[#5A5E55] md:text-base">{item.weight}</td>
                  <td className="border-2 border-[#1E1F1C] p-2 text-sm text-[#0a0a0a] md:text-base">{item.openMarket}</td>
                  <td className="border-2 border-[#1E1F1C] p-2 text-sm font-black text-[#f6a45d] md:text-base">{item.discount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1a1308] text-white">
                <td colSpan={2} className="border-2 border-[#1E1F1C] p-3 text-lg">TOTAL</td>
                <td className="border-2 border-[#1E1F1C] p-3 text-lg">{totalMarket}</td>
                <td className="border-2 border-[#1E1F1C] p-3 text-2xl font-black text-[#d8a928]">
                  {totalDiscounted}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 rounded-sm bg-[#f6a45d] p-4 text-center text-white">
          <p className="flex flex-wrap justify-center gap-4 text-lg font-bold md:text-xl">
            <span>Price: {totalMarket}/-</span>
            <span>Discount Price: {totalDiscounted}/-</span>
            <span className="text-[#d8a928]">Discount: {savings}/-</span>
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6">
          <a
            href="/collections/ramadan-packages"
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-[#f6a45d] px-12 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#d8861f] md:w-auto"
          >
            BUY NOW
            <svg className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          <div className="grid w-full grid-cols-4 gap-2 border-t border-[#d8a928] pt-6 opacity-80">
            {['HANDLE WITH CARE', 'THIS SIDE UP', 'FRAGILE', 'KEEP DRY'].map((label, i) => (
              <div key={label} className="flex flex-col items-center text-[8px] font-bold text-[#0a0a0a] md:text-[10px]">
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded border-2 border-[#1E1F1C] bg-[#fcf5e8] text-lg md:h-12 md:w-12">
                  {['📦', '↑↑', '🍷', '☔'][i]}
                </div>
                <span className="text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
