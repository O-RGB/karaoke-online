import React, { ReactNode } from "react";
import { useContextMenu } from "use-context-menu";
import "use-context-menu/styles.css";
import "./menu-style-test.css"; // Ensure these styles work well with Tailwind
import ContextMenuForm from "@/components/form/context-form";
// import "./menu-style.css";

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  className?: string;
  leftClick?: boolean;
}

const ContextMenuCommon: React.FC<ContextMenuProps> = ({
  children,
  items,
  className,
  leftClick = false,
}) => {
  const { contextMenu, onContextMenu } = useContextMenu(
    <ContextMenuForm items={items}></ContextMenuForm>
  );

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event);
  };

  return (
    <>
      <div
        className={[className, "select-none"].join(" ")}
        data-test-name="click-target"
        onContextMenu={handleContextMenu}
        onClick={leftClick ? handleContextMenu : undefined}
      >
        {children}
      </div>
      {contextMenu}
    </>
  );
};

export default ContextMenuCommon;
