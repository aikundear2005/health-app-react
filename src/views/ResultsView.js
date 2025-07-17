// src/views/ResultsView.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [itemData, setItemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        const response = await fetch(`${API_BASE_URL}/api/${type}/${itemKey}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `找不到資料 (狀態碼: ${response.status})`);
        }
        const data = await response.json();
        setItemData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, itemKey]);

  if (isLoading) {
    return <Spin fullscreen tip="正在獲取詳細資料..." />;
  }

  const renderDetailCard = () => {
    if (error || !itemData) {
      return (
        <Card>
          <Paragraph style={{ textAlign: 'center', color: 'red' }}>
             資料載入失敗：{error || `找不到對應的資料：「${itemKey ? decodeURIComponent(itemKey) : "未知項目"}」。`}
          </Paragraph>
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
        <Paragraph style={{ textAlign: 'center', color: 'red' }}>
          未知的資料類型：「{type}」。
        </Paragraph>
      </Card>
    );
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
      </div>
      <Title level={2}>查詢結果</Title>
      {renderDetailCard()}
    </div>
  );
}

export default ResultsView;

// ==================================================================
// src/views/ScenariosView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin, Alert } from 'antd';
import './ScenariosView.css';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://proactive-health-backend.onrender.com' 
  : '';

function ScenariosView() {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/list/scenarios`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '無法獲取情境列表');
        }
        const data = await response.json();
        setScenarios(Object.values(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  if (isLoading) return <Spin fullscreen tip="載入情境中..." />;
  if (error) return <Alert message="錯誤" description={error} type="error" showIcon />;

  return (
    <div className="scenarios-view-container">
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
        常見情境與對應建議
      </Title>
      <Paragraph style={{ textAlign: 'center', marginBottom: '40px', fontSize: '16px' }}>
        您是否正面臨以下情況？點擊卡片，探索更貼近您生活的整合性建議。
      </Paragraph>
      <Row gutter={[24, 24]}>
        {scenarios.map((scenario) => (
          <Col xs={24} sm={12} md={8} key={scenario.name}>
            <Link to={`/scenarios/${encodeURIComponent(scenario.name)}`}>
              <Card
                hoverable
                className="scenario-card"
              >
                <Meta
                  avatar={<span className="scenario-icon">{scenario.icon}</span>}
                  title={<Title level={4}>{scenario.name}</Title>}
                  description={<Paragraph ellipsis={{ rows: 3 }}>{scenario.description}</Paragraph>}
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ScenariosView;
