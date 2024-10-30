import { useState } from "react";

type Tab = {
  icon?: React.ReactNode;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  onTabChange?: (activeIndex: number) => void;
};

const Tabs: React.FC<TabsProps> = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="h-full">
      <div className="flex border-b border-gray-300 overflow-auto w-full h-10">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              onTabChange?.(index);
              setActiveTab(index);
            }}
            className={`py-2 px-4 focus:outline-none transition text-nowrap text-sm flex gap-2 items-center justify-center ${
              activeTab === index
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-3"></div>
      <div key={activeTab} className="tab-content ">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
