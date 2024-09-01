import React, { ReactNode, useEffect } from "react";
import { useContextMenu, ContextMenuItem } from "use-context-menu";
import "use-context-menu/styles.css";
import "./menu-style-test.css"; // Ensure these styles work well with Tailwind
// import "./menu-style.css";

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
}

const ContextMenuCommon: React.FC<ContextMenuProps> = ({ children, items }) => {
  const { contextMenu, onContextMenu, onKeyDown } = useContextMenu(
    <div>
      {items?.map((item, index) => (
        <ContextMenuItem
          key={`context-menu-${index}`}
          onSelect={() => {
            item.onClick?.(
              item.type,
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </span>
            );
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="min-w-5">{item.icon}</span>
            <span>{item.text}</span>
          </span>
        </ContextMenuItem>
      ))}
    </div>
  );

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event);
  };

  return (
    <>
      <div
        className="fixed z-0 left-0 top-0 w-screen h-screen"
        data-test-name="click-target"
        onContextMenu={handleContextMenu}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        {children}
      </div>
      {contextMenu}
    </>
  );
};

export default ContextMenuCommon;
