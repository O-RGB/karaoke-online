import { CSSProperties, useState } from "react";

interface TabsProps {
  height?: number;
  tabs: TabProps[];
  onTabChange?: (activeIndex: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, onTabChange, height }) => {
  const [activeTab, setActiveTab] = useState(0);

  const autoHeight: CSSProperties = height
    ? { maxHeight: height + 2, height: `100%`, overflowY: "auto" }
    : {};

  if (tabs.length <= 1) {
    return (
      <div style={{ ...autoHeight }} className="p-2 lg:p-4">
        {tabs[0].content}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" style={{ ...autoHeight }}>
      {tabs.length > 0 && <div className="sticky top-0 flex border-b border-gray-300 w-full h-12 bg-white z-50 overflow-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              onTabChange?.(index);
              setActiveTab(index);
            }}
            className={`py-2 px-4 focus:outline-none transition text-nowrap text-sm flex gap-2 items-center justify-center ${activeTab === index
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>}

      <div
        key={activeTab}
        style={{ height: `91%` }}
        className="relative tab-content w-full p-2 lg:p-4"
      >
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
