/**
 * 사용자 권한 관리 유틸리티
 * 
 * 권한 계층:
 * - 비회원 (GUEST): 로그인하지 않은 사용자
 * - 일반회원 (GENERAL): 상품 구매만 가능
 * - 전공회원 (MAJOR): 상품 구매 + Community 글쓰기 가능 (Board, Lounge만)
 * - 운영자 (ADMIN): 모든 권한
 * - 판매자 권한 (isSeller): 선택적으로 부여되는 상품 등록 권한
 */

export type UserRole = 'GENERAL' | 'MAJOR' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'REQUESTED' | 'APPROVED' | 'REJECTED';

export const permissions = {
  /**
   * 글 작성 권한 (Community - Board, Lounge만)
   * @param role - 사용자 역할
   * @param verificationStatus - 인증 상태
   * @returns 글 작성 가능 여부
   */
  canWritePost: (role?: UserRole, verificationStatus?: string): boolean => {
    if (!role) return false; // 비회원 불가
    if (role === 'ADMIN') return true; // 관리자는 항상 가능
    if (role === 'MAJOR') return true; // 전공 회원은 항상 가능 (이미 관리자 승인을 받은 상태)
    return false;
  },

  /**
   * Archive 글 보기 권한 (Projects, News)
   * @returns 모든 사용자 가능 (비회원 포함)
   */
  canViewArchive: (): boolean => {
    return true; // 모든 사용자 가능
  },

  /**
   * Community 글 목록 보기 권한
   * @returns 모든 사용자 가능 (비회원 포함)
   */
  canViewCommunityList: (): boolean => {
    return true; // 모든 사용자 가능
  },

  /**
   * Community 글 세부내용 보기 권한
   * @param role - 사용자 역할
   * @returns 로그인한 사용자만 가능
   */
  canViewCommunityPost: (role?: UserRole): boolean => {
    return !!role; // 로그인한 사용자만 가능
  },

  /**
   * 글 수정/삭제 권한
   * @param role - 사용자 역할
   * @param authorId - 글 작성자 ID
   * @param userId - 현재 사용자 ID
   * @returns 수정/삭제 가능 여부
   */
  canEditPost: (role?: UserRole, authorId?: string, userId?: string): boolean => {
    if (!role || !userId) return false;
    // 관리자는 모든 글 수정 가능
    if (role === 'ADMIN') return true;
    // 본인이 작성한 글만 수정 가능
    return authorId === userId;
  },

  /**
   * 댓글 작성 권한
   * @param role - 사용자 역할
   * @returns 댓글 작성 가능 여부
   */
  canWriteComment: (role?: UserRole): boolean => {
    if (!role) return false; // 비회원 불가
    return role === 'MAJOR' || role === 'ADMIN';
  },

  /**
   * 상품 보기 권한
   * @returns 모든 사용자 가능 (비회원 포함)
   */
  canViewProduct: (): boolean => {
    return true; // 모든 사용자 가능
  },

  /**
   * 상품 구매 권한
   * @param role - 사용자 역할
   * @returns 상품 구매 가능 여부
   */
  canPurchaseProduct: (role?: UserRole): boolean => {
    if (!role) return false; // 비회원 불가
    return role === 'GENERAL' || role === 'MAJOR' || role === 'ADMIN';
  },

  /**
   * 상품 등록 권한
   * @param role - 사용자 역할
   * @returns 상품 등록 가능 여부
   */
  canAddProduct: (role?: UserRole, isSeller?: boolean): boolean => {
    if (role === 'ADMIN') return true;
    return !!isSeller;
  },

  /**
   * 상품 수정/삭제 권한
   * @param role - 사용자 역할
   * @returns 상품 수정/삭제 가능 여부
   */
  canEditProduct: (role?: UserRole, isSeller?: boolean, authorId?: string | null, userId?: string | null): boolean => {
    if (!role || !userId) return false;
    if (role === 'ADMIN') return true;
    if (isSeller && authorId && authorId === userId) return true;
    return false;
  },

  /**
   * 학생 인증 요청 권한
   * @param role - 사용자 역할
   * @param verificationStatus - 현재 인증 상태
   * @returns 학생 인증 요청 가능 여부
   */
  canRequestVerification: (role?: UserRole, verificationStatus?: VerificationStatus): boolean => {
    if (!role) return false;
    // 일반회원만 요청 가능
    if (role !== 'GENERAL') return false;
    // 이미 요청했거나 승인된 경우 불가
    return verificationStatus === 'PENDING' || verificationStatus === 'REJECTED';
  },

  /**
   * 학생 인증 승인/거부 권한
   * @param role - 사용자 역할
   * @returns 학생 인증 처리 가능 여부
   */
  canApproveVerification: (role?: UserRole): boolean => {
    return role === 'ADMIN';
  },

  /**
   * 학생 인증 내역 조회 권한
   * @param role - 사용자 역할
   * @param requestUserId - 요청자 ID
   * @param currentUserId - 현재 사용자 ID
   * @returns 조회 가능 여부
   */
  canViewVerification: (role?: UserRole, requestUserId?: string, currentUserId?: string): boolean => {
    if (!role || !currentUserId) return false;
    // 관리자는 모든 인증 내역 조회 가능
    if (role === 'ADMIN') return true;
    // 본인의 인증 내역만 조회 가능
    return requestUserId === currentUserId;
  },

  /**
   * Archive 글 작성 권한 (프로젝트, 뉴스 등록)
   * @param role - 사용자 역할
   * @returns Archive 글 작성 가능 여부
   */
  canWriteArchive: (role?: UserRole): boolean => {
    return role === 'ADMIN';
  },

  /**
   * 관리자 페이지 접근 권한
   * @param role - 사용자 역할
   * @returns 관리자 페이지 접근 가능 여부
   */
  canAccessAdmin: (role?: UserRole): boolean => {
    return role === 'ADMIN';
  },

  /**
   * 주문 내역 조회 권한
   * @param role - 사용자 역할
   * @param orderUserId - 주문자 ID
   * @param currentUserId - 현재 사용자 ID
   * @returns 주문 내역 조회 가능 여부
   */
  canViewOrder: (role?: UserRole, orderUserId?: string, currentUserId?: string): boolean => {
    if (!role || !currentUserId) return false;
    // 관리자는 모든 주문 조회 가능
    if (role === 'ADMIN') return true;
    // 본인의 주문만 조회 가능
    return orderUserId === currentUserId;
  },
};

/**
 * 역할별 권한 설명
 */
export const roleDescriptions: Record<UserRole, string> = {
  GENERAL: '일반회원 - 상품 구매만 가능',
  MAJOR: '전공회원 - 상품 구매 및 Community 글쓰기 가능 (Board, Lounge만)',
  ADMIN: '운영자 - 모든 권한 보유'
};

export const sellerDescription = '판매자 권한 - 상품 등록 및 판매 가능';

/**
 * 인증 상태별 설명
 */
export const verificationStatusDescriptions: Record<VerificationStatus, string> = {
  PENDING: '인증 대기 - 아직 학생 인증을 요청하지 않았습니다',
  REQUESTED: '인증 요청됨 - 운영자 승인을 기다리는 중입니다',
  APPROVED: '승인 완료 - 학생회원으로 전환되었습니다',
  REJECTED: '거부됨 - 인증이 거부되었습니다'
};

/**
 * 권한 오류 메시지
 */
export const permissionErrors = {
  notLoggedIn: '로그인이 필요한 서비스입니다.',
  insufficientPermission: '권한이 부족합니다.',
  studentOnly: '학생회원만 이용 가능한 서비스입니다.',
  adminOnly: '운영자만 접근 가능합니다.',
  verificationRequired: '학생 인증이 필요합니다.',
  alreadyRequested: '이미 인증을 요청하셨습니다.',
  cannotPurchase: '상품 구매 권한이 없습니다. 회원가입이 필요합니다.',
};

