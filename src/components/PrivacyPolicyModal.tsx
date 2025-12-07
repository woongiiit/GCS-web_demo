'use client'

const imgVector827 = "https://www.figma.com/api/mcp/asset/55427538-6462-441d-a94a-7dab18a23fb5"
const imgVector828 = "https://www.figma.com/api/mcp/asset/22eb1380-1414-4192-8d4e-aa388ad79344"
const imgEllipse5406 = "https://www.figma.com/api/mcp/asset/71768f38-bfa8-4396-863c-799403cf0e38"
const imgEllipse5405 = "https://www.figma.com/api/mcp/asset/66f7de73-3955-4b50-b0e1-b6e339d26a10"
const imgEllipse5404 = "https://www.figma.com/api/mcp/asset/35f2edc6-4d32-442c-b764-dad1a3a5ea2a"
const imgVector = "https://www.figma.com/api/mcp/asset/115960ee-81ce-40a5-ba8e-2913491faca6"
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/876f7036-1e49-4f04-80bb-1c864a81e384"
const imgLogo1 = "https://www.figma.com/api/mcp/asset/6d18cd23-face-4072-b0c3-f9523f863e02"
const imgLogo2 = "https://www.figma.com/api/mcp/asset/605be9b9-d2b9-4fbd-ba2f-e77180a99468"
const imgLogo3 = "https://www.figma.com/api/mcp/asset/1cfb265a-b2b7-46a1-8406-05fac9e0d833"
const imgLogo4 = "https://www.figma.com/api/mcp/asset/c45ab428-3976-43fd-94aa-213981bf93c3"
const imgLogo5 = "https://www.figma.com/api/mcp/asset/c31973ae-11ed-4f00-b99d-7fb6d83be4b0"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
                  <p className="font-bold leading-[1.5] text-[22px] text-[#5f5a58] text-center">
                    개인정보 수집·이용 동의
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

