'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import AboutTermsModal from '@/components/AboutTermsModal'

// Figma image asset URLs
const img15 = "https://www.figma.com/api/mcp/asset/2d3d1652-8692-4526-bc0e-0d12ef32aced";
const img = "https://www.figma.com/api/mcp/asset/e98384d0-da13-4bb4-8f17-eed376fa94fb";
const img1 = "https://www.figma.com/api/mcp/asset/46b0d905-4963-47d5-85c1-c3fb0d7b0d4d";
const img2 = "https://www.figma.com/api/mcp/asset/e29ae3e6-1e22-4532-a2bc-11ecb3f11e4e";
const img3 = "https://www.figma.com/api/mcp/asset/60698448-4b9f-447c-8ba4-0ae328c0a351";
const img4 = "https://www.figma.com/api/mcp/asset/ef08ede0-94ff-4359-b0ab-1569102f0134";
const imgVector = "https://www.figma.com/api/mcp/asset/5d8e99da-ec61-4d26-97b7-e206b4acd949";
const imgEllipse33 = "https://www.figma.com/api/mcp/asset/d94c0c84-ae63-40e1-bc2c-1c059fc022cc";
const imgRectangle2 = "https://www.figma.com/api/mcp/asset/141b3cf6-eb4b-4e6b-bc65-d8a0c13a7ecb";
const imgBurger = "https://www.figma.com/api/mcp/asset/12b8fd6e-6811-4056-a06f-b620cedd4e82";
const img5 = "https://www.figma.com/api/mcp/asset/0083f04b-c6c4-4f79-955f-16d8539ba33e";
const img6 = "https://www.figma.com/api/mcp/asset/1988d300-64b1-4f7d-83d0-7298e4cbb843";
const img7 = "https://www.figma.com/api/mcp/asset/05dd2805-4ef3-4ff1-ba31-67a4571ca807";
const img8 = "https://www.figma.com/api/mcp/asset/27891397-84ba-4270-ba80-ace71723ecd7";
const img9 = "https://www.figma.com/api/mcp/asset/3c7f601f-bae1-4dea-93a0-5c9e33362501";
const imgRectangle2823 = "https://www.figma.com/api/mcp/asset/c563b6d3-bf4e-4d5e-baa3-53d9919aa020";
const imgEllipse5500 = "https://www.figma.com/api/mcp/asset/4a7dadcd-6334-4360-ab52-416cdc1663dd";
const imgVector833 = "https://www.figma.com/api/mcp/asset/3e0937a4-188d-4440-8afb-01c250a13233";
const imgVector832 = "https://www.figma.com/api/mcp/asset/c67ec032-bbd3-4e57-b118-cd149c833abb";
const imgEllipse5499 = "https://www.figma.com/api/mcp/asset/5e3cac17-231b-41de-aba8-9786ecbc75a2";
const imgEllipse5498 = "https://www.figma.com/api/mcp/asset/01de0ab6-e574-4e4c-a267-6bcc2726283d";
const img10 = "https://www.figma.com/api/mcp/asset/316bc817-cd0d-429f-a016-004c8a485c9d";
const img11 = "https://www.figma.com/api/mcp/asset/f37cb3f3-f073-4ebf-9d97-d79094b1d589";
const img12 = "https://www.figma.com/api/mcp/asset/86e46eff-6cce-499c-bef5-48f766278a46";
const img13 = "https://www.figma.com/api/mcp/asset/2a580831-a472-4cc2-9bcd-e642ab898a27";
const img14 = "https://www.figma.com/api/mcp/asset/958abeb9-dba2-4e7d-a87a-db65334651bd";
const imgLine321 = "https://www.figma.com/api/mcp/asset/246ee4de-fbea-417b-b60e-84f4cd557bf9";
const imgVector1 = "https://www.figma.com/api/mcp/asset/d08fc08c-0b59-45a6-a170-19404df8702c";
const imgVector2 = "https://www.figma.com/api/mcp/asset/1ff3edf4-6378-492d-87ba-4ccdcfa7d648";

function LsiconRightFilled({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-[25.91%_36.2%_25.91%_35.29%]">
        <img alt="" className="block max-w-none size-full" src={imgVector} />
      </div>
    </div>
  );
}

function IconexLightUser({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute contents left-[5px] top-[3px]">
        <div className="absolute flex items-center justify-center left-[8px] size-[8px] top-[3px]">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="relative size-[8px]">
              <div className="absolute inset-[-9.38%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse33} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[7.5px] left-[5px] top-[13px] w-[14px]">
          <div className="absolute inset-[3.85%_-5.36%_-6.03%_-5.36%]">
            <img alt="" className="block max-w-none size-full" src={imgRectangle2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconexLightBurger({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute h-[12px] left-[4px] top-[6px] w-[16px]">
        <div className="absolute inset-[-6.25%_-4.69%]">
          <img alt="" className="block max-w-none size-full" src={imgBurger} />
        </div>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
      <div className="bg-[#f8f6f4] h-[44px] overflow-clip relative shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)] shrink-0 w-full">
        <IconexLightBurger className="absolute left-[16px] size-[24px] top-[10px]" />
        <IconexLightUser className="absolute inset-[22.73%_4.27%_22.73%_89.33%]" />
        <div className="absolute h-[18.9px] left-[160.69px] top-[12.55px] w-[53.62px]">
          <div className="absolute inset-[1.48%_82.19%_0_0]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img5} />
          </div>
          <div className="absolute inset-[0_0_0_68.67%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img6} />
          </div>
          <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img7} />
          </div>
          <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img8} />
          </div>
          <div className="absolute inset-[1.48%_32.86%_0_36.07%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img9} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ onTermsClick }: { onTermsClick?: () => void }) {
  return (
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
                  onClick={onTermsClick}
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
  );
}

export default function Home() {
  const [projects, setProjects] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [bestProducts, setBestProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [currentShopIndex, setCurrentShopIndex] = useState(0)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shopSlideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  // Auto slide functionality - projects
  useEffect(() => {
    if (projects.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentProjectIndex((prevIndex) => 
          prevIndex === projects.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000)
    }

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current)
      }
    }
  }, [projects.length])

  // Auto slide functionality - products (3개씩 그룹으로 로테이션)
  useEffect(() => {
    const groupCount = Math.ceil(bestProducts.length / 3)
    if (groupCount > 1) {
      shopSlideIntervalRef.current = setInterval(() => {
        setCurrentShopIndex((prevIndex) =>
          prevIndex === groupCount - 1 ? 0 : prevIndex + 1
        )
      }, 5000)
    }

    return () => {
      if (shopSlideIntervalRef.current) {
        clearInterval(shopSlideIntervalRef.current)
      }
    }
  }, [bestProducts.length])

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current)
      }
      if (shopSlideIntervalRef.current) {
        clearInterval(shopSlideIntervalRef.current)
      }
    }
  }, [])

  // Manual slide function - projects
  const goToProjectSlide = (index: number) => {
    setCurrentProjectIndex(index)
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current)
    }
    slideIntervalRef.current = setInterval(() => {
      setCurrentProjectIndex((prevIndex) => 
        prevIndex === projects.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
  }

  // Manual slide function - products (3개씩 그룹으로 로테이션)
  const goToShopSlide = (index: number) => {
    setCurrentShopIndex(index)
    if (shopSlideIntervalRef.current) {
      clearInterval(shopSlideIntervalRef.current)
    }
    const groupCount = Math.ceil(bestProducts.length / 3)
    shopSlideIntervalRef.current = setInterval(() => {
      setCurrentShopIndex((prevIndex) =>
        prevIndex === groupCount - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
  }

  const fetchHomeData = async () => {
    try {
      const [projectsRes, newsRes, productsRes] = await Promise.all([
        fetch('/api/archive/projects?featured=true'),
        fetch('/api/archive/news'),
        fetch('/api/shop/products?sort=likes&limit=9')
      ])

      const [projectsData, newsData, productsData] = await Promise.all([
        projectsRes.json(),
        newsRes.json(),
        productsRes.json()
      ])

      if (projectsData.success) {
        setProjects(projectsData.data)
      }

      if (newsData.success) {
        setNews(newsData.data.slice(0, 3))
      }

      if (productsData.success) {
        setBestProducts(productsData.data.slice(0, 9))
      }
    } catch (error) {
      console.error('홈 데이터 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col items-start relative w-full">
      <div className="h-[78px] shrink-0 w-full" />
          
      {/* Hero Section */}
      <div className="aspect-[375/243.75] sm:aspect-[375/243.75] md:aspect-[375/243.75] overflow-clip relative shrink-0 w-full max-w-full">
        <div className="absolute inset-0 left-0 top-0 w-full">
          <img alt="" className="block max-w-none size-full object-cover" src={imgRectangle2823} />
        </div>
        <div className="absolute h-[161.4%] left-[-22%] top-[-11.9%] w-[124.6%]">
          <div className="absolute inset-[-22.39%_-18.81%]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5500} />
          </div>
        </div>
        <div className="absolute flex h-[87.2%] items-center justify-center left-[-9.4%] top-[22.2%] w-[114%]">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="h-full relative w-full">
              <img alt="" className="block max-w-none size-full" src={imgVector833} />
            </div>
          </div>
        </div>
        <div className="absolute h-[74.5%] left-[-21.1%] top-[61.4%] w-[114%]">
          <img alt="" className="block max-w-none size-full" src={imgVector832} />
        </div>
        <div className="absolute flex items-center justify-center left-1/2 w-[81.1%] aspect-square top-[calc(50%+40.5%)] translate-x-[-50%] translate-y-[-50%]">
          <div className="flex-none rotate-[131.046deg]">
            <div className="relative size-full">
              <div className="absolute inset-[-23.11%_-20.39%_-17.67%_-20.39%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse5499} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center left-[calc(50%+39.2%)] w-[52.8%] aspect-square top-[-21.1%] translate-x-[-50%]">
          <div className="flex-none rotate-[131.046deg]">
            <div className="relative size-full">
              <div className="absolute inset-[-6.27%_-18.8%_-14.62%_-2.09%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse5498} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex flex-col items-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[91.5%] max-w-[343px]">
          <div className="h-[21.5%] relative shrink-0 w-[43.2%] aspect-[148.242/52.441]">
            <div className="absolute bottom-0 left-0 right-[82.19%] top-[1.48%]">
              <img alt="GCS Logo" className="block max-w-none size-full" src={img10} />
            </div>
            <div className="absolute bottom-0 left-[68.67%] right-0 top-0">
              <img alt="GCS Logo" className="block max-w-none size-full" src={img11} />
            </div>
            <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
              <img alt="GCS Logo" className="block max-w-none size-full" src={img12} />
            </div>
            <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
              <img alt="GCS Logo" className="block max-w-none size-full" src={img13} />
            </div>
            <div className="absolute bottom-0 left-[36.07%] right-[32.86%] top-[1.48%]">
              <img alt="GCS Logo" className="block max-w-none size-full" src={img14} />
            </div>
            </div>
          </div>
        </div>

      {/* Content Section */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-11 md:py-12 relative shrink-0 w-full">
        <div className="flex flex-col items-center relative shrink-0 w-full max-w-[343px] sm:max-w-[600px] md:max-w-[800px]">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
              <img alt="" className="block max-w-none size-full" src={imgLine321} />
            </div>
        </div>

          {/* Archive Section */}
          <div className="flex flex-col gap-12 sm:gap-16 md:gap-20 items-center pb-0 pt-6 sm:pt-8 md:pt-10 px-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-start relative shrink-0 w-full">
              <div className="flex flex-col items-start px-4 sm:px-6 md:px-8 py-0 relative shrink-0 w-full">
                <Link href="/archive" className="flex items-center opacity-80 pl-0 pr-0.5 py-0 relative shrink-0 w-full">
                  <div className="flex flex-col items-start mr-[-2px] relative shrink-0">
                    <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-xl sm:text-2xl md:text-3xl text-[#1a1918]">
                      Archive
                    </p>
                  </div>
                  <LsiconRightFilled className="mr-[-2px] relative shrink-0 size-6 sm:size-7 md:size-8" />
                </Link>
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-center relative shrink-0 w-full">
                {isLoading ? (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-32 w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f57520]"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <>
                    <div className="flex items-center px-3 sm:px-4 md:px-6 py-0 relative shrink-0 w-full">
                      <Link href={`/archive/projects/${projects[currentProjectIndex]?.id}`} className="border border-[#717171] border-solid flex items-center justify-center overflow-clip relative rounded sm:rounded-md md:rounded-lg shrink-0 w-full">
                        <div className="aspect-[1080/1350] flex-[1_0_0] min-h-px min-w-px relative shadow-[0px_4.4px_11px_0px_rgba(0,0,0,0.2)] shrink-0">
                          {projects[currentProjectIndex]?.images?.[0] ? (
                            <img
                              alt={projects[currentProjectIndex].title}
                              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                              src={projects[currentProjectIndex].images[0]}
                              onError={(e) => {
                                e.currentTarget.src = img15
                              }}
                            />
                          ) : (
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img15} />
                          )}
                        </div>
                      </Link>
                    </div>
                    <p className="font-light leading-[1.5] not-italic relative shrink-0 text-sm sm:text-base md:text-lg text-[#1a1918] text-center px-4">
                      GCS의 프로젝트를 만나보세요
                    </p>
                    <div className="flex gap-3 sm:gap-4 md:gap-5 items-center justify-center relative shrink-0 w-full">
                      {projects.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToProjectSlide(index)}
                          className={`relative shrink-0 size-[6px] ${index === currentProjectIndex ? 'opacity-100' : 'opacity-50'}`}
                        >
                          <img
                            alt=""
                            className="block max-w-none size-full"
                            src={index === currentProjectIndex ? imgVector2 : imgVector1}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm w-full">
                    등록된 프로젝트가 없습니다.
                  </div>
                )}
              </div>
            </div>
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                <img alt="" className="block max-w-none size-full" src={imgLine321} />
              </div>
            </div>
          </div>

          {/* Shop Section */}
          <div className="flex flex-col gap-12 sm:gap-16 md:gap-20 items-center pb-0 pt-6 sm:pt-8 md:pt-10 px-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-start relative shrink-0 w-full">
              <div className="flex flex-col items-start px-4 sm:px-6 md:px-8 py-0 relative shrink-0 w-full">
                <Link href="/shop" className="flex items-center opacity-80 pl-0 pr-0.5 py-0 relative shrink-0 w-full">
                  <div className="flex flex-col items-start mr-[-2px] relative shrink-0">
                    <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-xl sm:text-2xl md:text-3xl text-[#1a1918]">
                      Shop
                    </p>
                  </div>
                  <LsiconRightFilled className="mr-[-2px] relative shrink-0 size-6 sm:size-7 md:size-8" />
                      </Link>
                <div className="flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-light leading-[1.5] not-italic relative shrink-0 text-xs sm:text-sm md:text-base text-[#1a1918]">
                      GCS 계획공간 학생들의 작품을 만나보세요
                    </p>
                  </div>
                  </div>
                </div>
              <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 items-start relative shrink-0 w-full">
              {isLoading ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 w-full">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg aspect-[109.308/136.635] sm:aspect-[109.308/136.635] md:aspect-[109.308/136.635] animate-pulse"></div>
                  ))}
                </div>
              ) : bestProducts.length > 0 ? (
                <>
                    <div className="flex gap-1 sm:gap-2 md:gap-3 items-center px-1 sm:px-2 md:px-3 py-0 relative shrink-0 w-full overflow-x-auto scrollbar-hide">
                      {bestProducts
                        .slice(currentShopIndex * 3, currentShopIndex * 3 + 3)
                        .map((product, index) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          className="border border-[#717171] border-solid flex items-center justify-center overflow-clip relative rounded sm:rounded-md md:rounded-lg shrink-0 flex-shrink-0"
                        >
                          <div className="h-[136.635px] sm:h-[160px] md:h-[180px] relative shadow-[0px_1.508px_3.769px_0px_rgba(0,0,0,0.2)] shrink-0 w-[109.308px] sm:w-[128px] md:w-[144px] aspect-[109.308/136.635]">
                            {product.images?.[0] ? (
                              <img
                                alt={product.name}
                                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                                src={product.images[0]}
                                onError={(e) => {
                                  e.currentTarget.src = img15
                                }}
                              />
                            ) : (
                              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img15} />
                            )}
                        </div>
                      </Link>
                    ))}
                  </div>
                    <div className="flex gap-3 sm:gap-4 md:gap-5 items-center justify-center relative shrink-0 w-full">
                      {Array.from({ length: Math.ceil(bestProducts.length / 3) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToShopSlide(index)}
                          className={`relative shrink-0 size-1.5 sm:size-2 md:size-2.5 ${index === currentShopIndex ? 'opacity-100' : 'opacity-50'}`}
                        >
                          <img
                            alt=""
                            className="block max-w-none size-full"
                            src={index === currentShopIndex ? imgVector2 : imgVector1}
                          />
                        </button>
                    ))}
                  </div>
                </>
              ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm w-full">
                  등록된 상품이 없습니다.
                </div>
              )}
          </div>
        </div>
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                <img alt="" className="block max-w-none size-full" src={imgLine321} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer onTermsClick={() => setIsTermsModalOpen(true)} />
      </div>
      {isTermsModalOpen && (
        <AboutTermsModal 
          isOpen={isTermsModalOpen} 
          onClose={() => setIsTermsModalOpen(false)} 
        />
      )}
    </>
  )
}
