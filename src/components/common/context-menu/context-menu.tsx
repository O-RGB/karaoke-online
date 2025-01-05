import React from "react";
import "./menu-style.css";
import { MenuItem, MenuDivider, MenuHeader } from "@szhsin/react-menu";

interface ContextMenuProps {
  items: IContextMenuGroup<ModalType>[];
}

const ContextMenuCommon: React.FC<ContextMenuProps> = ({ items }) => {
  function MenuRender({
    icon,
    title,
    size = "15px",
    gap = "gap-2",
  }: {
    icon: React.ReactNode;
    title: string;
    size?: string;
    gap?: string;
  }) {
    return (
      <span className={`flex items-center ${gap}`}>
        <span
          style={{
            fontSize: size,
          }}
        >
          {icon}
        </span>
        <span className="pb-1">{title}</span>
      </span>
    );
  }

  return items.map((data, i) => {
    return (
      <React.Fragment key={`menu-item-${i}`}>
        {data.contextMenus.length > 1 ? (
          <>
            {i > 0 && <MenuDivider />}
            {data.name && (
              <MenuHeader
                style={{
                  fontSize: 10,
                }}
              >
                {data.name}
              </MenuHeader>
            )}
            {data.contextMenus.map((group, j) => (
              <React.Fragment key={`menu-item-${i}-${j}`}>
                <MenuItem
                  onClick={() =>
                    group.onClick?.(
                      group.type,
                      // <MenuRender
                      //   icon={group.icon}
                      //   title={group.text}
                      //   size="25px"
                      //   gap="gap-3"
                      // ></MenuRender>
                      group.text
                    )
                  }
                  style={{
                    fontSize: 14,
                    gap: 10,
                  }}
                >
                  <i>{group.icon}</i>
                  <span>{group.text}</span>
                </MenuItem>
              </React.Fragment>
            ))}
          </>
        ) : (
          <MenuItem
            onClick={() =>
              data.contextMenus[0].onClick?.(
                data.contextMenus[0].type,
                // <MenuRender
                //   icon={data.contextMenus[0].icon}
                //   title={data.contextMenus[0].text}
                //   size="25px"
                //   gap="gap-3"
                // ></MenuRender>
                data.contextMenus[0].text
              )
            }
            style={{
              fontSize: 14,
              gap: 10,
            }}
          >
            <i>{data.contextMenus[0].icon}</i>
            <span>{data.contextMenus[0].text}</span>
          </MenuItem>
        )}
      </React.Fragment>
    );
  });
};

export default ContextMenuCommon;
