import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 匯入我們討論的「藥物-類別」對應表
import { drugToCategoryMap } from '../utils/drugMapping.js'; 
import './ResultsView.css';

/**
 * 核心資料請求函數
 * @param {string} type - 查詢類型 (目前只處理 'drug')
 * @param {string} itemKey - 從 URL 傳入的藥物名稱
 * @returns {Promise<object>} API回傳的資料
 */
const fetchItemData = async (type, itemKey) => {
  // 目前只處理 'drug' 類型
  if (type !== 'drug') {
    throw new Error(`目前不支援查詢類型: ${type}`);
  }

  const API_BASE_URL = 'https://drug-nutrient-tool.vercel.app';
  
  try {
    const decodedItemKey = decodeURIComponent(itemKey);
    console.log(`[FETCH] 開始處理查詢: "${decodedItemKey}"`);

    // 【核心邏輯】: 查詢對應表，將藥物名稱轉換為藥物類別
    const category = drugToCategoryMap[decodedItemKey];

    if (!category) {
      // 如果在對應表中找不到，直接拋出錯誤，不呼叫 API
      console.error(`[FETCH] 在對應表中找不到藥物: "${decodedItemKey}"`);
      throw new Error(`很抱歉，我們的資料庫中目前沒有 "${decodedItemKey}" 的資料，請檢查名稱或嘗試其他藥物。`);
    }

    // 使用查詢到的類別來建立 API URL
    const encodedCategory = encodeURIComponent(category);
    const url = `${API_BASE_URL}/api/drug/${encodedCategory}`;
    
    console.log(`[FETCH] 藥物 "${decodedItemKey}" 對應到類別 "${category}", 正在呼叫 API:`, url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });

    console.log('[FETCH] API 回應狀態:', response.status);
    
    if (!response.ok) {
      throw new Error(`API 伺服器錯誤! 狀態: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[FETCH] API 成功，回應數據:', data);
    
    // 將原始藥物名稱和類別一起回傳，方便 UI 顯示
    return { ...data, originalQuery: decodedItemKey, queryCategory: category };

  } catch (error) {
    console.error('[FETCH] 資料處理或API調用時發生錯誤:', error);
    // 將捕捉到的、更友善的錯誤訊息往上拋，讓元件的 state可以接收
    throw error;
  }
};


const ResultsView = () => {
  const { type, itemKey } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!type || !itemKey) {
        setError('缺少必要的頁面參數');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setData(null);
      
      try {
        console.log('[UI] 開始載入數據, type:', type, 'itemKey:', itemKey);
        const result = await fetchItemData(type, itemKey);
        setData(result);
      } catch (err) {
        console.error('[UI] 載入數據失敗:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, itemKey]);

  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');

  if (loading) {
    return (
      <div className="results-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-view">
        <div className="error-container">
          <h2>載入失敗</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={handleGoBack} className="btn-secondary">返回上頁</button>
            <button onClick={handleGoHome} className="btn-primary">回到首頁</button>
            <button onClick={() => window.location.reload()} className="btn-secondary">重新載入</button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    // 這個狀態理論上會被 loading 或 error 覆蓋，但作為一個保險
    return (
      <div className="results-view">
        <div className="no-data-container">
          <h2>找不到數據</h2>
          <p>抱歉，找不到相關資訊</p>
          <div className="no-data-actions">
            <button onClick={handleGoBack} className="btn-secondary">返回上頁</button>
            <button onClick={handleGoHome} className="btn-primary">回到首頁</button>
          </div>
        </div>
      </div>
    );
  }

  // 根據類型顯示不同的內容格式
  const renderContent = () => {
    const commonFields = ['name', 'description', 'benefits', 'sideEffects', 'contraindications', 'usage', 'originalQuery', 'queryCategory'];
    
    return (
      <div className="content-sections">
        <section className="content-section">
          <h2>{data.name || data.originalQuery}</h2>
          <p className="category-tag">藥物類別: {data.queryCategory}</p>
        </section>
        
        {data.description && <section className="content-section"><h3>描述</h3><p>{data.description}</p></section>}
        {data.benefits && <section className="content-section"><h3>益處</h3><p>{data.benefits}</p></section>}
        {data.sideEffects && <section className="content-section"><h3>副作用</h3><p>{data.sideEffects}</p></section>}
        {data.contraindications && <section className="content-section"><h3>禁忌症</h3><p>{data.contraindications}</p></section>}
        {data.usage && <section className="content-section"><h3>使用方法</h3><p>{data.usage}</p></section>}

        {/* 顯示 API 回傳的其他欄位 */}
        {Object.keys(data).map(key => {
          if (!commonFields.includes(key) && data[key] && typeof data[key] === 'string') {
            return (
              <section key={key} className="content-section">
                <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                <p>{data[key]}</p>
              </section>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="results-view">
      <div className="results-header">
        <button onClick={handleGoBack} className="back-button">← 返回</button>
        <h1>{data.originalQuery || data.name || itemKey}</h1>
      </div>
      
      <div className="results-content">
        {renderContent()}
      </div>
      
      <div className="results-footer">
        <button onClick={handleGoHome} className="btn-primary">回到首頁</button>
      </div>
      
      {/* 開發環境下顯示的除錯資訊 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <h4>除錯資訊:</h4>
          <p>原始路由參數 (Type): {type}</p>
          <p>原始路由參數 (ItemKey): {itemKey}</p>
          <p>查詢的藥物: {data.originalQuery}</p>
          <p>對應的類別: {data.queryCategory}</p>
          <pre>API 回應全文: {JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
