// src/views/ScenariosView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin, Alert } from 'antd';
import './ScenariosView.css'; // <-- 將 CSS import 移到所有 import 語句的末尾

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const BACKEND_URL = 'https://proactive-health-backend.onrender.com';

function ScenariosView() {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/list/scenarios`);
        if (!response.ok) throw new Error('無法獲取情境列表');
        const data = await response.json();
        setScenarios(Object.values(data)); // 將物件轉換為陣列以便 .map
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
            {/* 修正: 將 scenario.name 轉換為 URL-friendly 的 ID */}
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
