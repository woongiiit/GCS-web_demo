'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// Figma ?¥Î?ÏßÄ ?êÏÖã URL
const img15 = "https://www.figma.com/api/mcp/asset/2d3d1652-8692-4526-bc0e-0d12ef32aced";
const img = "https://www.figma.com/api/mcp/asset/e98384d0-da13-4bb4-8f17-eed376fa94fb";
const img1 = "https://www.figma.com/api/mcp/asset/46b0d905-4963-47d5-85c1-c3fb0d7b0d4d";
const img2 = "https://www.figma.com/api/mcp/asset/e29ae3e6-1e22-4532-a2bc-11ecb3f11e4e";
const img3 = "https://www.figma.com/api/mcp/asset/60698448-4b9f-447c-8ba4-0ae328c0a351";
const img4 = "https://www.figma.com/api/mcp/asset/ef08ede0-94ff-4359-b0ab-1569102f0134";
const imgVector = "https://www.figma.com/api/mcp/asset/0a995d7f-de2e-4118-ae65-eb1ce18c5c52";
const imgEllipse33 = "https://www.figma.com/api/mcp/asset/a64a5532-6b5e-496e-a097-2795fe5eaa7b";
const imgRectangle2 = "https://www.figma.com/api/mcp/asset/bcac8693-6418-4ca0-8f72-cfd1d6efb8ff";
const imgBurger = "https://www.figma.com/api/mcp/asset/072f7790-bf98-40f2-a30e-9810b119bae2";
const img5 = "https://www.figma.com/api/mcp/asset/3e922fd1-d3b6-4c16-b656-29ce2c510927";
const img6 = "https://www.figma.com/api/mcp/asset/49b44c54-d352-4fba-957d-e0eef2807346";
const img7 = "https://www.figma.com/api/mcp/asset/2065aeff-5198-4db5-8a17-110b855c7746";
const img8 = "https://www.figma.com/api/mcp/asset/8e1ac3cc-d216-4688-aa15-af7317fa0960";
const img9 = "https://www.figma.com/api/mcp/asset/c1cb625d-09ce-41f3-a12d-492ed7e1a320";
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

// ?ÑÏù¥ÏΩ?Ïª¥Ìè¨?åÌä∏
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

// NavBar Ïª¥Ìè¨?åÌä∏
function NavBar() {
  return (
    <div>
      <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
      <div className="bg-[#f8f6f4] h-[44px] overflow-clip relative shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)] shrink-0 w-full">
        <IconexLightBurger className="absolute left-[16px] size-[24px] top-[10px]" />
        <IconexLightUser className="absolute inset-[22.73%_4.27%_22.73%_89.33%]" />
        <Link href="/" className="absolute h-[18.9px] left-[160.69px] top-[12.55px] w-[53.62px]">
          <div className="absolute bottom-0 left-0 right-[82.19%] top-[1.48%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img5} />
          </div>
          <div className="absolute bottom-0 left-[68.67%] right-0 top-0">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img6} />
          </div>
          <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img7} />
          </div>
          <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img8} />
          </div>
          <div className="absolute bottom-0 left-[36.07%] right-[32.86%] top-[1.48%]">
            <img className="block max-w-none size-full" alt="GCS Logo" src={img9} />
          </div>
        </Link>
      </div>
    </div>
  );
}

// Footer Ïª¥Ìè¨?åÌä∏
function Footer() {
  return (
    <div className="bg-[#f8f6f4]">
      <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
      <div className="bg-[#f8f6f4] content-stretch flex items-center overflow-clip p-[21px] relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[45px] items-start relative shrink-0 w-[263px]">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-[#443e3c] w-full">
              <p className="leading-[1.5] whitespace-pre-wrap">Í≥†Í∞ùÏßÄ??/p>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
              <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                  <span className="font-bold not-italic tracking-[-0.26px]">?ÑÌôî</span>
                  <span>: 010-5238-0236</span>
                </p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0 whitespace-nowrap">
                <p className="leading-[1.5] text-[13px]">
                  <span className="font-bold not-italic tracking-[-0.26px]">?¥Î©î??/span>
                  <span>: gcsweb01234@gmail.com</span>
                </p>
              </div>
              <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                  <span className="font-bold not-italic tracking-[-0.26px]">Ï£ºÏÜå</span>
                  <span>: ?úÏö∏?πÎ≥Ñ??Í∞ïÎ∂ÅÍµ??îÏÉòÎ°?174 136??304??/span>
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-[#443e3c] w-full">
              <p className="leading-[1.5] whitespace-pre-wrap">?¨ÏóÖ???ïÎ≥¥</p>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
              <div className="content-stretch flex gap-[40px] items-center relative shrink-0 whitespace-nowrap">
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.5] text-[13px]">
                    <span className="font-bold not-italic tracking-[-0.26px]">?Ä??/span>
                    <span>: ?àÏÑ±?Ä</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0">
                  <p className="leading-[1.5] text-[13px]">
                    <span className="font-bold not-italic tracking-[-0.26px]">?åÏÇ¨Î™?/span>
                    <span>: ?àÎ∂Å???§Ìäú?îÏò§</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                  <span className="font-bold not-italic tracking-[-0.26px]">?¨ÏóÖ?êÎì±Î°ùÎ≤à??/span>
                  <span>: 693-01-03164</span>
                </p>
              </div>
              <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                  <span className="font-bold not-italic tracking-[-0.26px]">?µÏã†?êÎß§?ÖÏã†Í≥†Î≤à??/span>
                  <span>: ??025-?úÏö∏Ï§ëÍµ¨-0000??/span>
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[181px]">
            <div className="h-[21px] relative shrink-0 w-[59px]">
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
            <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 text-[8px] text-[#443e3c] w-full">
              <div className="flex flex-col justify-center relative shrink-0 w-full">
                <p className="leading-[1.5] whitespace-pre-wrap">¬© 2025 GCS:Web. All rights reserved.</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0 w-full">
                <p className="[text-underline-position:from-font] decoration-solid leading-[1.5] underline whitespace-pre-wrap">?¥Ïö©?ΩÍ?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
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
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const shopSlideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  // ?êÎèô ?¨Îùº?¥Îìú Í∏∞Îä• - ?ÑÎ°ú?ùÌä∏
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

  // ?êÎèô ?¨Îùº?¥Îìú Í∏∞Îä• - ?ÅÌíà
  useEffect(() => {
    if (bestProducts.length > 1) {
      shopSlideIntervalRef.current = setInterval(() => {
        setCurrentShopIndex((prevIndex) => 
          prevIndex === bestProducts.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000)
    }

    return () => {
      if (shopSlideIntervalRef.current) {
        clearInterval(shopSlideIntervalRef.current)
      }
    }
  }, [bestProducts.length])

  // Ïª¥Ìè¨?åÌä∏ ?∏Îßà?¥Ìä∏ ??cleanup
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

  // ?òÎèô ?¨Îùº?¥Îìú ?®Ïàò - ?ÑÎ°ú?ùÌä∏
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

  // ?òÎèô ?¨Îùº?¥Îìú ?®Ïàò - ?ÅÌíà
  const goToShopSlide = (index: number) => {
    setCurrentShopIndex(index)
    if (shopSlideIntervalRef.current) {
      clearInterval(shopSlideIntervalRef.current)
    }
    shopSlideIntervalRef.current = setInterval(() => {
      setCurrentShopIndex((prevIndex) => 
        prevIndex === bestProducts.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
  }

  const fetchHomeData = async () => {
    try {
      const [projectsRes, newsRes, productsRes] = await Promise.all([
        fetch('/api/archive/projects?featured=true'),
        fetch('/api/archive/news'),
        fetch('/api/shop/products?sort=likes&limit=3')
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
        setBestProducts(productsData.data.slice(0, 3))
      }
    } catch (error) {
      console.error('???∞Ïù¥??Ï°∞Ìöå ?§Î•ò:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col items-start relative w-full">
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <NavBar />
      </div>
      
      {/* Hero Section */}
      <div className="h-[243.75px] overflow-clip relative shrink-0 w-full max-w-[375px]">
        <div className="absolute h-[243.75px] left-0 top-0 w-full">
          <img alt="" className="block max-w-none size-full object-cover" src={imgRectangle2823} />
        </div>
        <div className="absolute h-[392.578px] left-[-82.62px] top-[-29px] w-[467.285px]">
          <div className="absolute inset-[-22.39%_-18.81%]">
            <img alt="" className="block max-w-none size-full" src={imgEllipse5500} />
          </div>
        </div>
        <div className="absolute flex h-[212.668px] items-center justify-center left-[-35.16px] top-[54.23px] w-[427.441px]">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="h-[212.668px] relative w-[427.441px]">
              <img alt="" className="block max-w-none size-full" src={imgVector833} />
            </div>
          </div>
        </div>
        <div className="absolute h-[181.574px] left-[-79.1px] top-[149.71px] w-[427.502px]">
          <img alt="" className="block max-w-none size-full" src={imgVector832} />
        </div>
        <div className="absolute flex items-center justify-center left-1/2 size-[304.117px] top-[calc(50%+98.74px)] translate-x-[-50%] translate-y-[-50%]">
          <div className="flex-none rotate-[131.046deg]">
            <div className="relative size-[215.556px]">
              <div className="absolute inset-[-23.11%_-20.39%_-17.67%_-20.39%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse5499} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center left-[calc(50%+146.99px)] size-[197.888px] top-[-51.56px] translate-x-[-50%]">
          <div className="flex-none rotate-[131.046deg]">
            <div className="relative size-[140.262px]">
              <div className="absolute inset-[-6.27%_-18.8%_-14.62%_-2.09%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse5498} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex flex-col items-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[343px]">
          <div className="h-[52.441px] relative shrink-0 w-[148.242px]">
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
      <div className="flex items-center justify-center px-[16px] py-[44px] relative shrink-0 w-full">
        <div className="flex flex-col items-center relative shrink-0 w-full max-w-[343px]">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
              <img alt="" className="block max-w-none size-full" src={imgLine321} />
            </div>
          </div>
          
          {/* Archive Section */}
          <div className="flex flex-col gap-[60px] items-center pb-0 pt-[32px] px-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div className="flex flex-col items-start px-[16px] py-0 relative shrink-0 w-full">
                <Link href="/archive" className="flex items-center opacity-80 pl-0 pr-[2px] py-0 relative shrink-0 w-full">
                  <div className="flex flex-col items-start mr-[-2px] relative shrink-0">
                    <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-[24px] text-[#1a1918]">
                      Archive
                    </p>
                  </div>
                  <LsiconRightFilled className="mr-[-2px] relative shrink-0 size-[32px]" />
                </Link>
              </div>
              <div className="flex flex-col gap-[20px] items-center relative shrink-0 w-full">
                {isLoading ? (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-32 w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f57520]"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <>
                    <div className="flex items-center px-[12px] py-0 relative shrink-0 w-full">
                      <Link href={`/archive/projects/${projects[currentProjectIndex]?.id}`} className="border border-[#717171] border-solid flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 w-full">
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
                    <p className="font-light leading-[1.5] not-italic relative shrink-0 text-[16px] text-[#1a1918]">
                      GCS???ÑÎ°ú?ùÌä∏Î•?ÎßåÎÇòÎ≥¥ÏÑ∏??
                    </p>
                    <div className="flex gap-[12px] items-center justify-center relative shrink-0 w-full">
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
                    ?±Î°ù???ÑÎ°ú?ùÌä∏Í∞Ä ?ÜÏäµ?àÎã§.
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
          <div className="flex flex-col gap-[60px] items-center pb-0 pt-[32px] px-0 relative shrink-0 w-full">
            <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div className="flex flex-col items-start px-[16px] py-0 relative shrink-0 w-full">
                <Link href="/shop" className="flex items-center opacity-80 pl-0 pr-[2px] py-0 relative shrink-0 w-full">
                  <div className="flex flex-col items-start mr-[-2px] relative shrink-0">
                    <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-[24px] text-[#1a1918]">
                      Shop
                    </p>
                  </div>
                  <LsiconRightFilled className="mr-[-2px] relative shrink-0 size-[32px]" />
                </Link>
                <div className="flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col items-start relative shrink-0">
                    <p className="font-light leading-[1.5] not-italic relative shrink-0 text-[12px] text-[#1a1918]">
                      GCS ?∞Í≥Ñ?ÑÍ≥µ ?ôÏÉù?§Ïùò ?úÏûë ?ÅÌíà???åÍ∞ú?©Îãà??
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[32px] items-start relative shrink-0 w-full">
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-[3.427px] w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg h-[136.635px] animate-pulse"></div>
                    ))}
                  </div>
                ) : bestProducts.length > 0 ? (
                  <>
                    <div className="flex gap-[3.427px] items-center px-[4.112px] py-0 relative shrink-0 w-full overflow-x-auto">
                      {bestProducts.map((product, index) => (
                        <Link 
                          key={product.id} 
                          href={`/shop/${product.id}`}
                          className="border border-[#717171] border-solid flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 flex-shrink-0"
                        >
                          <div className="h-[136.635px] relative shadow-[0px_1.508px_3.769px_0px_rgba(0,0,0,0.2)] shrink-0 w-[109.308px]">
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
                    <div className="flex gap-[12px] items-center justify-center relative shrink-0 w-full">
                      {bestProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToShopSlide(index)}
                          className={`relative shrink-0 size-[6px] ${index === currentShopIndex ? 'opacity-100' : 'opacity-50'}`}
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
                    ?±Î°ù???ÅÌíà???ÜÏäµ?àÎã§.
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
      
      <Footer />
    </div>
  )
}
