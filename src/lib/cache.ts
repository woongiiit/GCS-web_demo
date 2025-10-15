// 메모리 캐시 유틸리티

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();

  set(key: string, data: any, ttlMs: number = 300000) { // 기본 5분
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 패턴으로 캐시 삭제 (예: 특정 카테고리의 모든 상품 캐시 삭제)
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    // 먼저 삭제할 키들을 수집
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    // 수집된 키들을 삭제
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }

  // 캐시 상태 확인
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 싱글톤 인스턴스
export const memoryCache = new MemoryCache();

// 캐시 키 생성 헬퍼
export const generateCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// API 응답 캐싱 헬퍼
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 300000
): Promise<T> {
  // 캐시에서 먼저 확인
  const cached = memoryCache.get(key);
  if (cached !== null) {
    console.log(`Cache hit: ${key}`);
    return cached;
  }

  // 캐시에 없으면 데이터 가져오기
  console.log(`Cache miss: ${key}`);
  const data = await fetchFn();
  
  // 캐시에 저장
  memoryCache.set(key, data, ttlMs);
  
  return data;
}

// 캐시 무효화 헬퍼
export function invalidateCache(pattern: string): void {
  memoryCache.deletePattern(pattern);
  console.log(`Cache invalidated: ${pattern}`);
}
