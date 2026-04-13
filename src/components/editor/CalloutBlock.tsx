"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";

const calloutTypes = [
  { title: "Info", value: "info", icon: "💡", bg: "#e8f4fd", border: "#b8daf0" },
  { title: "Warning", value: "warning", icon: "⚠️", bg: "#fff8e6", border: "#f0dca0" },
  { title: "Error", value: "error", icon: "🚫", bg: "#fde8e8", border: "#f0b8b8" },
  { title: "Success", value: "success", icon: "✅", bg: "#e8fde8", border: "#b8f0b8" },
  { title: "Note", value: "note", icon: "📝", bg: "#f0f0f0", border: "#d0d0d0" },
] as const;

export const Callout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      type: {
        default: "info",
        values: ["info", "warning", "error", "success", "note"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const ct = calloutTypes.find((c) => c.value === props.block.props.type)!;
      return (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            borderRadius: "0.5rem",
            backgroundColor: ct.bg,
            border: `1px solid ${ct.border}`,
            width: "100%",
          }}
        >
          <Menu withinPortal={false}>
            <Menu.Target>
              <div
                contentEditable={false}
                style={{ cursor: "pointer", fontSize: "1.25rem", userSelect: "none", flexShrink: 0 }}
              >
                {ct.icon}
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Callout Type</Menu.Label>
              <Menu.Divider />
              {calloutTypes.map((type) => (
                <Menu.Item
                  key={type.value}
                  leftSection={<span>{type.icon}</span>}
                  onClick={() =>
                    props.editor.updateBlock(props.block, {
                      type: "callout",
                      props: { type: type.value },
                    })
                  }
                >
                  {type.title}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <div style={{ flex: 1 }} ref={props.contentRef} />
        </div>
      );
    },
  }
);
