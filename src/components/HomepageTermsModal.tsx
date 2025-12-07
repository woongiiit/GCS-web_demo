'use client'

const imgVector827 = "https://www.figma.com/api/mcp/asset/69f9b1dd-3784-47fb-84b3-3f0e224a7a04"
const imgVector828 = "https://www.figma.com/api/mcp/asset/0ee8438e-c1c3-4343-8d8f-c62709403667"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/4cb49522-1b4f-42a0-922c-8deda14cc459"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/9ec79bf4-1de2-4f98-93cc-350be443247e"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/4e5412db-1859-4cf4-a36c-e2063a24bcc0"
const imgVector = "https://www.figma.com/api/mcp/asset/74a13424-e5b1-4026-8004-5aec5cee1bf5"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/c06ea6c6-c77e-431f-bb8e-2f97968d02e8"
const imgLogo1 = "https://www.figma.com/api/mcp/asset/84409bb6-4f88-42dc-b6e7-8ae03a7c1e66"
const imgLogo2 = "https://www.figma.com/api/mcp/asset/b13ff731-a486-45d1-9b23-f7606afa0a49"
const imgLogo3 = "https://www.figma.com/api/mcp/asset/3453d900-c540-4b35-86d9-6dafaaf99982"
const imgLogo4 = "https://www.figma.com/api/mcp/asset/dbb43847-8e30-42b6-be8c-bd5504518648"
const imgLogo5 = "https://www.figma.com/api/mcp/asset/368276dd-b8ff-43fd-b6a4-5e9837d437c3"

interface HomepageTermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HomepageTermsModal({ isOpen, onClose }: HomepageTermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        {/* 배경 디자인 요소들 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[-47.67px] top-[-22.16px] w-[522.88px] h-[294.65px] flex items-center justify-center rotate-[339.444deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector827} />
          </div>
          <div className="absolute left-[-27.92px] top-[-23.12px] w-[567.01px] h-[447.70px] flex items-center justify-center rotate-[333.242deg]">
            <img alt="" className="block max-w-none size-full" src={imgVector828} />
          </div>
          <div className="absolute left-[106px] top-[-101px] w-[173.07px] h-[292.81px] flex items-center justify-center rotate-[5.928deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5406} />
          </div>
          <div className="absolute left-[192px] top-[-20px] w-[263.09px] h-[265.69px] flex items-center justify-center rotate-[43.746deg]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5405} />
          </div>
          <div className="absolute left-[5px] top-[68px] w-[145px] h-[145px]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5404} />
          </div>
        </div>

        {/* 오버레이 */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* 모달 컨텐츠 */}
        <div className="absolute left-0 top-[181px] w-full max-w-[375px] bg-[#f8f6f4] rounded-tl-[12px] rounded-tr-[12px] shadow-[0px_-4px_10px_0px_rgba(238,74,8,0.4)] pt-[96px] pb-[48px] px-[16px] max-h-[calc(100vh-181px)] overflow-y-auto">
          {/* 헤더 */}
          <div className="h-[33px] relative mb-10">
            <div className="absolute left-0 top-0 w-full">
              <div className="h-[33px] relative">
                <button
                  onClick={onClose}
                  className="absolute left-[48px] top-[4.5px] w-[24px] h-[24px] flex items-center justify-center"
                  aria-label="닫기"
                >
                  <div className="flex-none scale-y-[-100%]">
                    <div className="relative size-[24px]">
                      <div className="absolute contents left-[9px] top-[5px]">
                        <div className="absolute flex h-[14px] items-center justify-center left-[9px] top-[5px] w-[6px]">
                          <div className="flex-none rotate-[270deg]">
                            <div className="h-[6px] relative w-[14px]">
                              <img alt="" className="block max-w-none size-full" src={imgVector} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[158px]">
                  <p className="font-bold leading-[1.5] text-[22px] text-[#443e3c] text-center">
                    홈페이지 이용약관
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 약관 내용 */}
          <div className="flex flex-col gap-[60px] items-start">
            {/* 제1장 총칙 섹션들 */}
            {[1, 2, 3].map((section) => (
              <div key={section} className="flex flex-col gap-[24px] items-start">
                <div className="flex items-center justify-center">
                  <p className="font-bold leading-[1.55] text-[19px] text-[#5f5a58]">
                    제1장 총칙
                  </p>
                </div>
                <div className="flex flex-col gap-[12px] items-start">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex flex-col gap-[12px] items-start">
                      <div className="flex items-center justify-center">
                        <p className="font-bold leading-[1.5] text-[15px] text-[#5f5a58]">
                          제1조 (목적)
                        </p>
                      </div>
                      <div className="flex items-start">
                        <p className="font-normal leading-[1.5] text-[13px] text-[#5f5a58] tracking-[-0.26px] w-[343px] whitespace-pre-wrap">
                          본 약관은 안북스 스튜디오(이하 "회사")가 인터넷 사이트(https://gcsweb.kr)를 통하여 제공하는 회원 서비스, 크라우드펀딩 서비스, 스토어 서비스 등 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 다음 버튼 */}
          <div className="flex flex-col items-center px-2 mt-10">
            <button
              onClick={onClose}
              className="bg-[#c9c1b7] w-full h-[55px] rounded-[12px] flex items-center justify-center p-4 cursor-not-allowed"
              disabled
            >
              <p className="font-normal leading-[1.5] text-[15px] text-[#f8f6f4]">
                다음
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

