import React, { useState, useRef, useEffect } from "react";

type TreeNode = {
  label: string;
  children?: TreeNode[];
};

const initialData: TreeNode[] = [
  {
    label: "Fruits",
    children: [
      {
        label: "Citrus",
        children: [{ label: "Orange" }, { label: "Lemon" }]
      },
      {
        label: "Berries",
        children: [{ label: "Strawberry" }, { label: "Blueberry" }]
      }
    ]
  },
  {
    label: "Vegetables",
    children: [
      {
        label: "Leafy",
        children: [{ label: "Spinach" }, { label: "Kale" }]
      }
    ]
  }
];

const App: React.FC = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<boolean>(false);

  // Utility to get all leaf labels from a node
  const getAllLabels = (node: TreeNode): string[] => {
    if (!node.children) return [node.label];
    return node.children.flatMap(getAllLabels);
  };

  const toggleItem = (label: string, children?: TreeNode[]) => {
    const updated = new Set(selected);
    const allChildren = children
      ? getAllLabels({ label, children })
      : [label];

    const isSelected = allChildren.every((child) => updated.has(child));

    if (isSelected) {
      allChildren.forEach((child) => updated.delete(child));
    } else {
      allChildren.forEach((child) => updated.add(child));
    }

    setSelected(updated);
  };

  const isChecked = (
    label: string,
    children?: TreeNode[]
  ): boolean | "indeterminate" => {
    const allChildren = children
      ? getAllLabels({ label, children })
      : [label];

    const selectedCount = allChildren.filter((c) => selected.has(c)).length;
    if (selectedCount === 0) return false;
    if (selectedCount === allChildren.length) return true;
    return "indeterminate";
  };

  const renderTree = (nodes: TreeNode[], depth = 0): JSX.Element[] =>
    nodes.map(({ label, children }) => {
      const status = isChecked(label, children);
      const checkboxRef = useRef<HTMLInputElement>(null);

      useEffect(() => {
        if (checkboxRef.current) {
          checkboxRef.current.indeterminate = status === "indeterminate";
        }
      }, [status]);

      return (
        <div key={label} style={{ marginLeft: depth * 20 }}>
          <input
            type="checkbox"
            checked={status === true}
            ref={checkboxRef}
            onChange={() => toggleItem(label, children)}
          />
          {label}
          {children && renderTree(children, depth + 1)}
        </div>
      );
    });

  // Flatten all labels from leaf nodes
  const getAllLeafLabels = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((node) => getAllLabels(node));

  const allLeafLabels = getAllLeafLabels(initialData);
  const allSelected = allLeafLabels.every((label) => selected.has(label));

  const handleSelectAll = () => {
    const updated = new Set<string>();
    if (!allSelected) {
      allLeafLabels.forEach((label) => updated.add(label));
    }
    setSelected(updated);
  };

  const toggleDropdown = () => setOpen((prev) => !prev);

  return (
    <div style={{ position: "relative", width: "300px" }}>
      <input
        type="text"
        readOnly
        onClick={toggleDropdown}
        value={Array.from(selected).join(", ")}
        placeholder="Select options..."
      />
      {open && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: 10,
            position: "absolute",
            backgroundColor: "#fff",
            zIndex: 10,
            maxHeight: 300,
            overflowY: "auto"
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
            />{" "}
            Select All
          </div>
          {renderTree(initialData)}
        </div>
      )}
    </div>
  );
};

export default App;
