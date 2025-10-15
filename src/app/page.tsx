'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [projects, setProjects] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [bestProducts, setBestProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // 프로젝트 조회 (최신 1개, featured)
      const projectsRes = await fetch('/api/archive/projects?featured=true')
      const projectsData = await projectsRes.json()
      if (projectsData.success) {
        setProjects(projectsData.data.slice(0, 1))
      }

      // Archive 뉴스 조회 (최신 3개)
      const newsRes = await fetch('/api/archive/news')
      const newsData = await newsRes.json()
      if (newsData.success) {
        setNews(newsData.data.slice(0, 3))
      }

      // Best Item 상품 조회
      const productsRes = await fetch('/api/shop/products?bestItem=true')
      const productsData = await productsRes.json()
      if (productsData.success) {
        setBestProducts(productsData.data.slice(0, 3))
      }
    } catch (error) {
      console.error('홈 데이터 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      {/* 모바일 전용 레이아웃 */}
      <div className="md:hidden min-h-screen bg-[#f57520] -mt-4">
        {/* 모바일 주황색 섹션 - 텍스트만 포함 */}
        <div className="relative h-[clamp(240px,35vh,280px)] bg-[#f57520] pt-16">
          {/* GCS:Web 텍스트 - 주황색 영역의 왼쪽 아래 끝에 맞닿게 배치 */}
          <div className="absolute bottom-0 left-[2vw] text-white text-[clamp(3rem,14vw,4.25rem)] font-bold z-10">
            GCS:Web
          </div>
          
          {/* 동국대학교 텍스트 */}
          <div className="absolute bottom-[31%] right-[20%] text-white italic text-[clamp(12px,3.5vw,15px)] transform rotate-[23deg]">
            Dongguk University
          </div>
          
          {/* 흰색 직사각형 바 */}
          <div className="absolute bottom-[33%] right-[16%] w-[clamp(160px,60vw,224px)] h-1 bg-white transform rotate-[23deg]"></div>
          <div className="absolute bottom-[27.5%] right-[17%] w-[clamp(160px,60vw,224px)] h-[clamp(12px,3.5vw,16px)] bg-white transform rotate-[20deg]"></div>
        </div>

        {/* 주황색 직사각형들을 위한 영역 */}
        <div className="relative h-[clamp(180px,28vh,220px)] bg-white">
          <div className="absolute top-0 left-[2.5vw] w-[clamp(180px,70vw,300px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[-7deg]"></div>
          <div className="absolute top-[18%] left-[5vw] w-[clamp(190px,75vw,310px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[0deg]"></div>
          <div className="absolute top-[26%] left-[4.5vw] w-[clamp(185px,72vw,305px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[-1.5deg]"></div>
          <div className="absolute top-[34.5%] left-[2.5vw] w-[clamp(180px,70vw,300px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[-2deg]"></div>
          <div className="absolute top-[44.5%] left-[6vw] w-[clamp(195px,75vw,310px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[0deg]"></div>
          <div className="absolute top-[52%] left-[7.5vw] w-[clamp(200px,75vw,310px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[0deg]"></div>
          <div className="absolute top-[61%] left-[5vw] w-[clamp(190px,73vw,308px)] h-[clamp(14px,4vw,18px)] bg-[#f57520] z-0 transform rotate-[-0.5deg]"></div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-white px-4 pb-8">
            
            {/* Project Archive 섹션 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-1">
                Project Archive
              </h2>
              <span className="block w-8 h-0.5 bg-[#f57520] mb-2"></span>
              
              {isLoading ? (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f57520]"></div>
                </div>
              ) : projects.length > 0 ? (
                <>
                  {projects.map((project) => (
                    <Link key={project.id} href={`/archive?tab=projects`}>
                      <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <h3 className="font-bold text-base mb-2">{project.year} {project.title}</h3>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        </div>
                        {project.images && project.images[0] && (
                          <div className="ml-4 flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                              <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement!.innerHTML = '<span class="flex items-center justify-center w-full h-full bg-[#f57520] text-white text-2xl font-bold">GCS</span>'
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                  <div className="flex justify-center mt-3 space-x-1">
                    {projects.slice(0, 4).map((_, index) => (
                      <span key={index} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#f57520]' : 'bg-gray-300'}`}></span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                  등록된 프로젝트가 없습니다.
                </div>
              )}
            </div>

            {/* News 섹션 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-1">
                News
              </h2>
              <span className="block w-8 h-0.5 bg-[#f57520] mb-2"></span>
              
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg overflow-hidden h-32 animate-pulse"></div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {news.slice(0, 3).map((item) => (
                      <Link key={item.id} href={`/archive?tab=news`}>
                        <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                          <div className="h-20 bg-gray-300 overflow-hidden">
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-news.jpg'
                              }} />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center px-2">
                                <p className="text-xs font-semibold text-gray-700 line-clamp-2 text-center">{item.title}</p>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">— {item.year}년</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3 space-x-1">
                    {news.slice(0, 4).map((_, index) => (
                      <span key={index} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#f57520]' : 'bg-gray-300'}`}></span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                  등록된 뉴스가 없습니다.
                </div>
              )}
            </div>

            {/* Shop 섹션 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-1">
                Shop
              </h2>
              <span className="block w-8 h-0.5 bg-[#f57520] mb-2"></span>
              
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                      <div className="bg-gray-100 rounded-lg h-24 mb-2 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : bestProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {bestProducts.slice(0, 3).map((product) => (
                      <Link key={product.id} href={`/shop/${product.id}`}>
                        <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="bg-gray-100 rounded-lg h-24 mb-2 overflow-hidden">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.jpg'
                              }} />
                            ) : (
                              <div className="w-full h-full bg-gray-200"></div>
                            )}
                          </div>
                          <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.brand || 'GCS'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3 space-x-1">
                    {bestProducts.slice(0, 4).map((_, index) => (
                      <span key={index} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#f57520]' : 'bg-gray-300'}`}></span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                  등록된 상품이 없습니다.
                </div>
              )}
          </div>

        </div>

        {/* 하단 배너 */}
        <div className="bg-white py-6 border-t border-gray-200">
          <div className="px-4 flex justify-between items-start gap-4">
            {/* 왼쪽: 로고 정보 */}
            <div className="flex-shrink-0">
              <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
              <h3 className="text-sm font-bold text-black">
                GCS<span className="text-[#f57520]">:</span>Web
              </h3>
            </div>
            
            {/* 오른쪽: 회사 정보 */}
            <div className="flex-1 text-right space-y-1 min-w-0">
              <p className="text-[10px] text-gray-600 leading-tight">주소: 서울 필동로 1길 30, 동국대학교</p>
              <p className="text-[10px] text-gray-600 leading-tight">대표자: 김봉구 | 회사명: 제작담</p>
              <p className="text-[10px] text-gray-600 leading-tight">사업자번호: 000-00-00000</p>
              <p className="text-[10px] text-gray-600 leading-tight">통신판매업: 제0000-서울중구-0000호</p>
              
              <div className="flex items-center justify-end space-x-1.5 pt-1 whitespace-nowrap">
                <a href="#" className="text-[10px] text-gray-600 underline">개인정보처리방침</a>
                <span className="text-[10px] text-gray-400">|</span>
                <a href="#" className="text-[10px] text-gray-600 underline">이용약관</a>
                <span className="text-[10px] text-gray-400">|</span>
                <span className="text-[10px] text-gray-500">site by 제작담</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱 전용 레이아웃 */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto pt-32">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">GCS</h1>
            <p className="text-gray-600 mb-8">Graphic Communication Science</p>
            
            {/* 홈 아이콘 */}
            <div className="inline-block mb-8">
              <div className="w-6 h-6 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 컨텐츠 영역 (데스크톱) */}
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            
            {/* 환영 섹션 */}
            <div className="mb-12">
              <div className="bg-white rounded-lg p-8 mb-8">
                <h2 className="text-3xl font-bold text-black mb-4 text-center">환영합니다</h2>
                <p className="text-gray-600 text-center text-lg leading-relaxed">
                  동국대학교 GCS 연계전공 홈페이지에 오신 것을 환영합니다.
                </p>
              </div>
            </div>

            {/* 주요 섹션들 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">주요 섹션</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                
                {/* About GCS */}
                <Link href="/about" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#5B7C99'}20, ${'#5B7C99'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5B7C99' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#5B7C99' }}>About GCS</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#5B7C99'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>학부 소개</h3>
                      <p className="text-gray-600 text-sm">GCS:Web 전공 소개, 개설 과목, 교수진 정보를 확인하세요.</p>
                    </div>
                  </div>
                </Link>

                {/* Archive */}
                <Link href="/archive" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#8A9A5B'}20, ${'#8A9A5B'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8A9A5B' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#8A9A5B' }}>Archive</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#8A9A5B'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>프로젝트 & 뉴스</h3>
                      <p className="text-gray-600 text-sm">학부 프로젝트와 최신 소식을 연도별로 확인하세요.</p>
                    </div>
                  </div>
                </Link>

                {/* Community */}
                <Link href="/community" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#B85C47'}20, ${'#B85C47'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#B85C47' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#B85C47' }}>Community</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#B85C47'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>커뮤니티</h3>
                      <p className="text-gray-600 text-sm">학생들과 소통하고 정보를 공유하는 공간입니다.</p>
                    </div>
                  </div>
                </Link>

                {/* Shop */}
                <Link href="/shop" className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#AFA79D'}20, ${'#AFA79D'}40)` }}>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AFA79D' }}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <span className="font-semibold" style={{ color: '#AFA79D' }}>Shop</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:transition-colors transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#AFA79D'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}>GCS Shop</h3>
                      <p className="text-gray-600 text-sm">GCS 브랜드 상품을 만나보세요. 의류, 문구, 액세서리 등 다양한 상품이 있습니다.</p>
                    </div>
                  </div>
                </Link>

                {/* News & Updates */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#D4A056'}20, ${'#D4A056'}40)` }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A056' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <span className="font-semibold" style={{ color: '#D4A056' }}>News</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">최신 소식</h3>
                    <p className="text-gray-600 text-sm">학부의 최신 소식과 공지사항을 확인하세요.</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${'#5F4B66'}20, ${'#5F4B66'}40)` }}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#5F4B66' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold" style={{ color: '#5F4B66' }}>Contact</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">문의하기</h3>
                    <p className="text-gray-600 text-sm">학부에 대한 문의사항이 있으시면 언제든 연락주세요.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 통계 섹션 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">GCS 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#5B7C99' }}>500+</div>
                  <div className="text-gray-600">재학생</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#8A9A5B' }}>50+</div>
                  <div className="text-gray-600">졸업생</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#B85C47' }}>20+</div>
                  <div className="text-gray-600">수상 실적</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#AFA79D' }}>10+</div>
                  <div className="text-gray-600">프로그램</div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">최근 활동</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#D4A056' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">2025년 신입생 오리엔테이션</h3>
                      <p className="text-gray-600 text-sm">3월 2일 - 3월 6일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#D4A05620', color: '#D4A056' }}>진행중</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#8A9A5B' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">GCS 웹 개발 워크숍</h3>
                      <p className="text-gray-600 text-sm">2월 15일 - 2월 16일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#8A9A5B20', color: '#8A9A5B' }}>완료</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#5F4B66' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">졸업작품 전시회</h3>
                      <p className="text-gray-600 text-sm">2월 10일 - 2월 12일</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#5F4B6620', color: '#5F4B66' }}>완료</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 푸터 */}
          <div className="text-center text-gray-400 text-xs mt-12">
            DONGGUK UNIVERSITY
          </div>
        </div>
      </div>
    </>
  )
}