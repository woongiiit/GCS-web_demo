'use client'

import AboutTermsModal from '@/components/AboutTermsModal'
import { useState } from 'react'

// Figma image asset URLs
const img = "https://www.figma.com/api/mcp/asset/e98384d0-da13-4bb4-8f17-eed376fa94fb";
const img1 = "https://www.figma.com/api/mcp/asset/46b0d905-4963-47d5-85c1-c3fb0d7b0d4d";
const img2 = "https://www.figma.com/api/mcp/asset/e29ae3e6-1e22-4532-a2bc-11ecb3f11e4e";
const img3 = "https://www.figma.com/api/mcp/asset/60698448-4b9f-447c-8ba4-0ae328c0a351";
const img4 = "https://www.figma.com/api/mcp/asset/ef08ede0-94ff-4359-b0ab-1569102f0134";

export default function Footer() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-[#f8f6f4]">
        <div className="bg-[#f8f6f4] h-8 sm:h-9 md:h-10 shrink-0 w-full" />
        <div className="bg-[#f8f6f4] content-stretch flex items-center overflow-clip p-4 sm:p-5 md:p-6 relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-8 sm:gap-10 md:gap-12 items-start relative shrink-0 w-full max-w-[263px] sm:max-w-[400px] md:max-w-[600px]">
            <div className="content-stretch flex flex-col gap-2 sm:gap-3 md:gap-4 items-start relative shrink-0 w-full">
              <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-base sm:text-lg md:text-xl text-[#443e3c] w-full">
                <p className="leading-[1.5] whitespace-pre-wrap">고객지원</p>
              </div>
              <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-5 items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-xs sm:text-sm md:text-base whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">전화</span>
                    <span>: 010-5238-0236</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 whitespace-nowrap">
                  <p className="leading-[1.5] text-xs sm:text-sm md:text-base">
                    <span className="font-bold not-italic tracking-[-0.26px]">이메일</span>
                    <span>: gcsweb01234@gmail.com</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-xs sm:text-sm md:text-base whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">주소</span>
                    <span>: 서울특별시 강북구 수유동 174-136 304호</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-2 sm:gap-3 md:gap-4 items-start relative shrink-0 w-full">
              <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-base sm:text-lg md:text-xl text-[#443e3c] w-full">
                <p className="leading-[1.5] whitespace-pre-wrap">회사정보</p>
              </div>
              <div className="content-stretch flex flex-col gap-3 sm:gap-4 md:gap-5 items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
                <div className="content-stretch flex flex-col sm:flex-row gap-2 sm:gap-8 md:gap-10 items-start sm:items-center relative shrink-0">
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.5] text-xs sm:text-sm md:text-base">
                      <span className="font-bold not-italic tracking-[-0.26px]">대표</span>
                      <span>: 최성일</span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.5] text-xs sm:text-sm md:text-base">
                      <span className="font-bold not-italic tracking-[-0.26px]">사업자</span>
                      <span>: 강북구 튜토리오</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-xs sm:text-sm md:text-base whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">사업자등록번호</span>
                    <span>: 693-01-03164</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-xs sm:text-sm md:text-base whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">통신판매업신고번호</span>
                    <span>: 제2025-서울중구-0000호</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-2 sm:gap-3 md:gap-4 items-start relative shrink-0 w-full sm:w-[181px]">
              <div className="h-5 sm:h-6 md:h-7 relative shrink-0 w-[59px] sm:w-[70px] md:w-[80px]">
                <div className="absolute bottom-0 left-0 right-[82.19%] top-[1.48%]">
                  <img className="block max-w-none size-full" alt="GCS Logo" src={img} />
                </div>
                <div className="absolute bottom-0 left-[68.67%] right-0 top-0">
                  <img className="block max-w-none size-full" alt="GCS Logo" src={img1} />
                </div>
                <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
                  <img className="block max-w-none size-full" alt="GCS Logo" src={img2} />
                </div>
                <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
                  <img className="block max-w-none size-full" alt="GCS Logo" src={img3} />
                </div>
                <div className="absolute bottom-0 left-[36.07%] right-[32.86%] top-[1.48%]">
                  <img className="block max-w-none size-full" alt="GCS Logo" src={img4} />
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 text-[8px] sm:text-[10px] md:text-xs text-[#443e3c] w-full">
                <div className="flex flex-col justify-center relative shrink-0 w-full">
                  <p className="leading-[1.5] whitespace-pre-wrap">© 2025 GCS:Web. All rights reserved.</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 w-full">
                  <button
                    onClick={() => setIsTermsModalOpen(true)}
                    className="[text-underline-position:from-font] decoration-solid leading-[1.5] underline whitespace-pre-wrap text-left"
                  >
                    이용약관
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#f8f6f4] h-8 sm:h-9 md:h-10 shrink-0 w-full" />
      </div>
      {isTermsModalOpen && (
        <AboutTermsModal 
          isOpen={isTermsModalOpen} 
          onClose={() => setIsTermsModalOpen(false)} 
        />
      )}
    </>
  );
}
