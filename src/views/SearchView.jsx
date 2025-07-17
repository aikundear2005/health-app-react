// src/views/SearchView.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Tabs, Typography, Tag, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './SearchView.css';

const { Title, Paragraph } = Typography;

// 為每個分類定義熱門查詢項目
const hotSearches = {
  drug: [ '抗生素', '制酸劑 (胃藥)', '阿斯匹靈'],
  symptom: ['疲勞/精力不足', '肌肉疼痛/抽筋', '掉髮', '記憶力下降/腦霧'],
  nutrient: ['輔酶Q10', '維生素D', '鎂', 'B群維生素'],
  naturalPrescription: ['規律散步', '充足睡眠', '正念冥想'],
  lifestyleImpact: ['長期久坐', '高壓生活', '熬夜與睡眠不足'],
};

// 初始狀態顯示的組件
const EmptyState = () => (
    <div className="search-empty-state">
        <div className="search-empty-icon"><SearchOutlined /></div>
        <div className="search-empty-title">開始查詢</div>
        <Paragraph className="search-empty-description">
            請先在上方選擇一個分類，<br />然後輸入關鍵字進行查詢。
        </Paragraph>
    </div>
);


function SearchView({ database }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('drug');
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);

  const dataKeyMapping = useMemo(() => ({
    drug: 'drugs',
    symptom: 'symptoms',
    nutrient: 'nutrients',
    naturalPrescription: 'naturalPrescriptions',
    lifestyleImpact: 'lifestyleImpacts',
  }), []);

  const tabItems = [
    { key: 'drug', label: '藥物' },
    { key: 'symptom', label: '症狀' },
    { key: 'nutrient', label: '營養素' },
    { key: 'naturalPrescription', label: '自然處方' },
    { key: 'lifestyleImpact', label: '生活習慣' },
  ];
  
  // 處理搜尋框輸入與自動完成選項生成
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
        setOptions([]);
        return;
    }
    const dataKey = dataKeyMapping[activeTab];
    const currentData = database?.[dataKey] ? Object.values(database[dataKey]) : [];
    
    const filteredOptions = currentData
        .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
        .map(item => ({
            value: item.name,
            label: (
                <div className="search-suggestion-item">
                    <span>{item.name}</span>
                    <span className="search-suggestion-category">{item.category || activeTab}</span>
                </div>
            ),
        }));
    setOptions(filteredOptions);
  };

  // 當使用者從建議列表中選擇一項時
  const onSelect = (value) => {
    navigate(`/results/${activeTab}/${encodeURIComponent(value)}`, {
      state: { originalValue: value }
    });
  };

  // 處理熱門查詢點擊
  const handleHotSearchClick = (term) => {
    navigate(`/results/${activeTab}/${encodeURIComponent(term)}`, {
      state: { originalValue: term }
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchTerm('');
    setOptions([]);
  };

  return (
    <div className="search-view-container">
      <Title level={2} style={{ textAlign: 'center' }}>分類查詢</Title>
      <Paragraph style={{color: '#64748b', textAlign: 'center', marginBottom: '24px'}}>
        透過分類與關鍵字，精準查找您需要的資訊。
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" items={tabItems} className="category-tabs" />
      
      <AutoComplete
        className="category-search-input"
        options={options}
        onSelect={onSelect}
        onSearch={handleSearch}
        value={searchTerm}
        style={{ width: '100%' }}
        placeholder={`在「${tabItems.find(t => t.key === activeTab)?.label}」分類下搜尋...`}
        allowClear
      />

      {/* 熱門查詢區塊 */}
      <div className="hot-search-section">
          <span className="hot-search-title">熱門查詢：</span>
          <div className="hot-search-tags">
            {(hotSearches[activeTab] || []).map(term => (
                <Tag 
                    key={term} 
                    onClick={() => handleHotSearchClick(term)}
                    className="hot-search-tag"
                >
                    {term}
                </Tag>
            ))}
          </div>
      </div>

      {/* 根據是否有搜尋詞來決定顯示初始畫面或無結果 */}
      {searchTerm.length === 0 && <EmptyState />}
      
      {searchTerm.length > 0 && options.length === 0 && (
        <div className="search-no-results">
            在「{tabItems.find(t => t.key === activeTab)?.label}」分類下找不到結果。
        </div>
      )}

    </div>
  );
}

export default SearchView;
