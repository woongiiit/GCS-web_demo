'use client'

// Figma image asset URLs for NavBar
const imgVector = "https://www.figma.com/api/mcp/asset/5d8e99da-ec61-4d26-97b7-e206b4acd949";
const imgEllipse33 = "https://www.figma.com/api/mcp/asset/d94c0c84-ae63-40e1-bc2c-1c059fc022cc";
const imgRectangle2 = "https://www.figma.com/api/mcp/asset/141b3cf6-eb4b-4e6b-bc65-d8a0c13a7ecb";
const imgBurger = "https://www.figma.com/api/mcp/asset/12b8fd6e-6811-4056-a06f-b620cedd4e82";
const img5 = "https://www.figma.com/api/mcp/asset/0083f04b-c6c4-4f79-955f-16d8539ba33e";
const img6 = "https://www.figma.com/api/mcp/asset/1988d300-64b1-4f7d-83d0-7298e4cbb843";
const img7 = "https://www.figma.com/api/mcp/asset/05dd2805-4ef3-4ff1-ba31-67a4571ca807";
const img8 = "https://www.figma.com/api/mcp/asset/27891397-84ba-4270-ba80-ace71723ecd7";
const img9 = "https://www.figma.com/api/mcp/asset/3c7f601f-bae1-4dea-93a0-5c9e33362501";

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

export default function NavBar() {
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

