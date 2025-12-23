import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, Database } from 'firebase/database';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

// Firebase 초기화 (설정이 없으면 에러)
let app: ReturnType<typeof initializeApp> | undefined;
let database: Database | undefined;

try {
  // Firebase 설정 확인
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('⚠️ Firebase 설정이 없습니다. .env 파일을 확인해주세요.');
    throw new Error('Firebase 설정이 필요합니다.');
  }
  
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('✅ Firebase 초기화 성공');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  throw error;
}

/**
 * 도면 데이터 타입
 */
export interface FloorPlanData {
  buildingName: string;
  floor: number;
  objects: any[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 도면이 이미 존재하는지 확인
 */
export async function checkFloorPlanExists(buildingName: string, floor: number): Promise<boolean> {
  if (!database) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `buildings/${buildingName}/${floor}`));
    return snapshot.exists();
  } catch (error) {
    console.error('도면 존재 확인 실패:', error);
    throw error;
  }
}

/**
 * 도면 저장
 */
export async function saveFloorPlan(
  buildingName: string,
  floor: number,
  objects: any[]
): Promise<void> {
  try {
    // 중복 체크
    const exists = await checkFloorPlanExists(buildingName, floor);
    if (exists) {
      throw new Error('이미 해당 건물의 층이 존재합니다. 편집 페이지를 사용해주세요.');
    }

    const floorPlanData: FloorPlanData = {
      buildingName,
      floor,
      objects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!database) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    await set(ref(database, `buildings/${buildingName}/${floor}`), floorPlanData);
    console.log('도면 저장 완료:', floorPlanData);
  } catch (error) {
    console.error('도면 저장 실패:', error);
    throw error;
  }
}

/**
 * 도면 불러오기
 */
export async function loadFloorPlan(buildingName: string, floor: number): Promise<FloorPlanData | null> {
  if (!database) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `buildings/${buildingName}/${floor}`));
    
    if (snapshot.exists()) {
      return snapshot.val() as FloorPlanData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('도면 불러오기 실패:', error);
    throw error;
  }
}

/**
 * 특정 건물의 모든 층 목록 가져오기
 */
export async function getBuildingFloors(buildingName: string): Promise<number[]> {
  if (!database) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `buildings/${buildingName}`));
    
    if (snapshot.exists()) {
      const floors = Object.keys(snapshot.val()).map(floor => parseInt(floor));
      return floors.sort((a, b) => a - b);
    } else {
      return [];
    }
  } catch (error) {
    console.error('층 목록 가져오기 실패:', error);
    throw error;
  }
}

/**
 * 모든 건물 목록 가져오기
 */
export async function getAllBuildings(): Promise<string[]> {
  if (!database) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'buildings'));
    
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    } else {
      return [];
    }
  } catch (error) {
    console.error('건물 목록 가져오기 실패:', error);
    throw error;
  }
}

/**
 * 도면 업데이트 (편집용)
 */
export async function updateFloorPlan(
  buildingName: string,
  floor: number,
  objects: any[]
): Promise<void> {
  try {
    const floorPlanData: FloorPlanData = {
      buildingName,
      floor,
      objects,
      createdAt: new Date().toISOString(), // 기존 createdAt 유지하려면 먼저 불러와야 함
      updatedAt: new Date().toISOString(),
    };

    if (!database) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    await set(ref(database, `buildings/${buildingName}/${floor}`), floorPlanData);
    console.log('도면 업데이트 완료:', floorPlanData);
  } catch (error) {
    console.error('도면 업데이트 실패:', error);
    throw error;
  }
}

