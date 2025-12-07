'use client'

import { useState } from 'react'

const imgMaterialSymbolsLightClose = "https://www.figma.com/api/mcp/asset/50c917d8-9e57-4668-9595-442c1fbdee86"

export default function TermsOfServiceModal() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="w-full text-left underline decoration-solid leading-[1.5] cursor-pointer"
      >
        이용약관
      </button>
    )
  }

  return (
    <>
      {/* 모달 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 모달 컨텐츠 */}
        <div
          className="bg-white rounded-lg max-w-[375px] w-full max-h-[90vh] overflow-y-auto flex flex-col gap-5 items-end pb-10 pt-3 px-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="relative shrink-0 size-[24px] cursor-pointer"
            aria-label="닫기"
          >
            <img alt="닫기" className="block max-w-none size-full" src={imgMaterialSymbolsLightClose} />
          </button>

          {/* 이용약관 내용 */}
          <div className="flex items-start justify-center relative shrink-0 w-full">
            <div className="flex flex-col justify-center leading-[1.5] text-[10px] text-black w-full whitespace-pre-wrap font-normal">
              <p className="mb-0">이용약관</p>
              <p>
                제1조 목적
                <br aria-hidden="true" />
                <br aria-hidden="true" />
                {`본 이용약관은 "noplasticsunday.com"(이하 "사이트")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.`}
                <br aria-hidden="true" />
                <br aria-hidden="true" />
                제2조 용어의 정의
                <br aria-hidden="true" />
                <br aria-hidden="true" />본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.
                <br aria-hidden="true" />
                <br aria-hidden="true" />① 회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.
                <br aria-hidden="true" />② 이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.
                <br aria-hidden="true" />
                {`③ 회원 아이디(이하 "ID") : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.`}
                <br aria-hidden="true" />④ 비밀번호 : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.
                <br aria-hidden="true" />⑤ 운영자 : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.
                <br aria-hidden="true" />⑥ 해지 : 회원이 이용계약을 해약하는 것을 말합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
