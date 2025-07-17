// src/utils/drugMapping.js

// 這是一個藥物名稱到藥物類別的對應表
// KEY 是使用者可能輸入的「特定藥物名稱」 (品牌名或學名)
// VALUE 是 API 認得的「藥物類別」
export const drugToCategoryMap = {
  // 止痛藥 (Analgesics)
  '阿斯匹靈': '止痛藥',
  '普拿疼': '止痛藥',
  '乙醯胺酚': '止痛藥',
  'EVE': '止痛藥',
  '布洛芬': '止痛藥',

  // 降膽固醇藥 (Cholesterol-lowering drugs)
  '立普妥': '降膽固醇藥',
  '冠脂妥': '降膽固醇藥',

  // 降壓藥 (Antihypertensives)
  '脈優': '降壓藥',

  // 抗生素 (Antibiotics)
  '安滅菌': '抗生素',
  '盤尼西林': '抗生素',
  
  // 您可以根據需求，持續在這裡擴充這個列表
};