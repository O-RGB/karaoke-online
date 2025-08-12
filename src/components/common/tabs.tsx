import { CSSProperties, useState } from "react";
import AlertWapper from "./alert/alert-wapper";

interface TabProps {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  height?: number;
  tabs: TabProps[];
  onTabChange?: (activeIndex: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, onTabChange, height }) => {
  const [activeTab, setActiveTab] = useState(0);

  // ถ้าไม่มี tabs หรือมีแค่ 1 tab
  if (tabs.length === 0) {
    return <div className="p-2 lg:p-4">No tabs available</div>;
  }

  if (tabs.length === 1) {
    const singleTabStyle: CSSProperties = height
      ? { height: `${height}px`, overflow: "auto" }
      : { height: "100%", overflow: "auto" };

    return (
      <div className="p-2 lg:p-4" style={singleTabStyle}>
        <AlertWapper>{tabs[0].content}</AlertWapper>
      </div>
    );
  }

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  const containerStyle: CSSProperties = height
    ? { height: `${height}px` }
    : { height: "100%" };

  return (
    <div
      className="flex flex-col w-full"
      style={containerStyle}
    >
      <div className="flex-shrink-0 flex border-b border-gray-300 w-full h-12 bg-white overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`
              flex-shrink-0 py-2 px-4 focus:outline-none transition-colors
              text-nowrap text-sm flex gap-2 items-center justify-center
              hover:bg-gray-50 min-w-fit
              ${
                activeTab === index
                  ? "border-b-2 border-blue-500 text-blue-500 bg-blue-50"
                  : "text-gray-500 hover:text-blue-500"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden py-2">
        <div className="h-full min-h-full max-h-full overflow-auto px-2">
          <AlertWapper>{tabs[activeTab].content}</AlertWapper>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
