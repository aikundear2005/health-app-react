// src/views/ResultsView.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Typography, Spin, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import DrugDetailCard from '../components/details/DrugDetailCard';
import SymptomDetailCard from '../components/details/SymptomDetailCard';
import NutrientDetailCard from '../components/details/NutrientDetailCard';
import NaturalPrescriptionDetailCard from '../components/details/NaturalPrescriptionDetailCard';
import LifestyleImpactDetailCard from '../components/details/LifestyleImpactDetailCard';

const { Title, Paragraph } = Typography;
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://proactive-health-backend.onrender.com' 
  : '';

function ResultsView() {
  const { type, itemKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [itemData, setItemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 從 state 獲取原始值，或解碼 URL 參數
  const originalTerm = location.state?.originalValue || decodeURIComponent(itemKey);

  // API 端點映射
  const apiEndpoints = {
    drug: 'drug',
    symptom: 'symptom',
    nutrient: 'nutrient',
    naturalPrescription: 'natural-prescription',
    lifestyleImpact: 'lifestyle-impact',
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !itemKey) {
        setError('無效的查詢路徑。');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log(`正在查詢 ${type}: ${originalTerm}`);
        
        const endpoint = apiEndpoints[type];
        if (!endpoint) {
          throw new Error(`不支援的資料類型: ${type}`);
        }

        // 方法 1: 使用 POST 請求避免 URL 編碼問題
        let response;
        let data;
        
        try {
          response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: originalTerm })
          });
          
          if (response.ok) {
            data = await response.json();
            setItemData(data);
            return;
          }
        } catch (postError) {
          console.log('POST 請求失敗，嘗試 GET 請求:', postError.message);
        }

        // 方法 2: 如果 POST 失敗，嘗試 GET 請求
        try {
          // 使用雙重編碼來確保中文字符正確傳遞
          const encodedTerm = encodeURIComponent(originalTerm);
          response = await fetch(`${API_BASE_URL}/api/${endpoint}/${encodedTerm}`);
          
          if (response.ok) {
            data = await response.json();
            setItemData(data);
            return;
          }
        } catch (getError) {
          console.log('GET 請求也失敗:', getError.message);
        }

        // 如果兩種方法都失敗，拋出錯誤
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`找不到「${originalTerm}」相關資料`);
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API 請求失敗 (狀態碼: ${response.status})`);
        }

      } catch (err) {
        console.error('資料獲取失敗:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, itemKey, originalTerm]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          正在獲取「{originalTerm}」的詳細資料...
        </div>
      </div>
    );
  }

  const renderDetailCard = () => {
    if (error || !itemData) {
      return (
        <Card>
          <Alert
            message="資料載入失敗"
            description={error || `找不到對應的資料：「${originalTerm}」。`}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <div style={{ textAlign: 'center' }}>
            <Button onClick={() => navigate('/search')}>
              返回搜尋頁面
            </Button>
          </div>
        </Card>
      );
    }

    const componentMapping = {
      drug: <DrugDetailCard drugData={itemData} />,
      symptom: <SymptomDetailCard symptomData={itemData} />,
      nutrient: <NutrientDetailCard nutrientData={itemData} />,
      naturalPrescription: <NaturalPrescriptionDetailCard prescriptionData={itemData} />,
      lifestyleImpact: <LifestyleImpactDetailCard impactData={itemData} />,
    };

    return componentMapping[type] || (
      <Card>
        <Alert
          message="未知的資料類型"
          description={`不支援的資料類型：「${type}」。`}
          type="warning"
          showIcon
        />
      </Card>
    );
  };

  // 分類標籤映射
  const typeLabels = {
    drug: '藥物',
    symptom: '症狀',
    nutrient: '營養素',
    naturalPrescription: '自然處方',
    lifestyleImpact: '生活習慣',
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginRight: '16px' }}
        >
          返回上一頁
        </Button>
        <Button onClick={() => navigate('/')}>
          返回首頁
        </Button>
        <Button onClick={() => navigate('/search')}>
          重新搜尋
        </Button>
      </div>
      
      <Title level={2}>
        {typeLabels[type] || '查詢'}結果：{originalTerm}
      </Title>
      
      {renderDetailCard()}
    </div>
  );
}

export default ResultsView;
