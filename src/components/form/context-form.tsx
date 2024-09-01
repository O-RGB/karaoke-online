import React from "react";
import { ContextMenuItem } from "use-context-menu";

interface ContextMenuFormProps {
  items: ContextMenuItem[];
}

const ContextMenuForm: React.FC<ContextMenuFormProps> = ({ items }) => {
  return (
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
};

export default ContextMenuForm;
