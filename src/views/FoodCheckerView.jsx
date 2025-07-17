// src/views/FoodCheckerView.jsx

import React, { useState, useEffect } from 'react';
// ... (其他 import 維持不變)
import { AutoComplete, Card, Tabs, Tag, Typography, Alert, Spin } from 'antd';
import InteractionCard from '../components/shared/InteractionCard';
import EmptyState from '../components/food-checker/EmptyState';
import SearchSection from '../components/food-checker/SearchSection';
import ResultCard from '../components/food-checker/ResultCard';
import './FoodCheckerView.css';

const { Title, Paragraph } = Typography;
const BACKEND_URL = 'https://proactive-health-backend.onrender.com'; // 定義後端網址

function FoodCheckerView() {
    const [allDrugs, setAllDrugs] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDrugList = async () => {
            try {
                // --- 使用絕對路徑 ---
                const response = await fetch(`${BACKEND_URL}/api/list/drugs`);
                if (!response.ok) throw new Error('無法獲取藥物列表');
                const data = await response.json();
                setAllDrugs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDrugList();
    }, []);

    // ... (其餘 handleSelectDrug 等函數維持不變)
    const handleSelectDrug = (drugName) => {
        setIsSearching(true);
        const drug = allDrugs.find(d => d.name === drugName);
        
        setTimeout(() => {
            setSelectedDrug(drug);
            setIsSearching(false);
        }, 500);
    };

    if (isLoading) {
        return <Spin fullscreen tip="正在初始化查詢器..." />;
    }

    if (error) {
        return <Alert message="錯誤" description={error} type="error" showIcon />;
    }

    return (
        <div className="food-checker-container">
            <header className="checker-header">
                <Title level={2} className="checker-title">🍽️ 飲食相容查詢器</Title>
                <Paragraph className="checker-subtitle">
                    正在服用特定藥物嗎？輸入藥物名稱，即可查詢建議留意或避免的飲食與生活習慣。
                </Paragraph>
            </header>
            
            <main className="checker-main-content">
                <SearchSection allDrugs={allDrugs} onSelectDrug={handleSelectDrug} />
                
                {isSearching && <div className="loading-spinner"><div></div></div>}

                {!isSearching && !selectedDrug && <EmptyState />}
                
                {!isSearching && selectedDrug && <ResultCard drug={selectedDrug} />}
            </main>
        </div>
    );
}

export default FoodCheckerView;