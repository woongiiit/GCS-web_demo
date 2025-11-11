export {}

declare global {
  interface PortOneCheckout {
    init: (merchantCode: string) => void
    request_pay: (params: any, callback: (response: any) => void) => void
  }

  interface Window {
    IMP?: PortOneCheckout
  }
}

