import React, { useState } from "react";

const initialData = [
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

const App = () => {
  const [selected, setSelected] = useState(new Set());
  const [open, setOpen] = useState(false);

  const toggleItem = (label, children) => {
    const updated = new Set(selected);
    const getAllLabels = (node) =>
      node.children ? node.children.flatMap(getAllLabels) : [node.label];

    const allChildren = children ? getAllLabels({ label, children }) : [label];
    const isSelected = allChildren.every((child) => selected.has(child));

    if (isSelected) {
      allChildren.forEach((child) => updated.delete(child));
    } else {
      allChildren.forEach((child) => updated.add(child));
    }

    setSelected(updated);
  };

  const isChecked = (label, children) => {
    const getAllLabels = (node) =>
      node.children ? node.children.flatMap(getAllLabels) : [node.label];
    const allChildren = children ? getAllLabels({ label, children }) : [label];
    const selectedCount = allChildren.filter((c) => selected.has(c)).length;
    if (selectedCount === 0) return false;
    if (selectedCount === allChildren.length) return true;
    return "indeterminate";
  };

  const renderTree = (nodes, depth = 0) =>
    nodes.map(({ label, children }) => {
      const status = isChecked(label, children);

      return (
        <div key={label} style={{ marginLeft: depth * 20 }}>
          <input
            type="checkbox"
            checked={status === true}
            ref={(el) => el && (el.indeterminate = status === "indeterminate")}
            onChange={() => toggleItem(label, children)}
          />
          {label}
          {children && renderTree(children, depth + 1)}
        </div>
      );
    });

  const toggleDropdown = () => setOpen(!open);
  const allLabels = initialData.flatMap((group) =>
    group.children.flatMap((sub) => sub.children.map((item) => item.label))
  );

  const allSelected = allLabels.every((l) => selected.has(l));

  const handleSelectAll = () => {
    const updated = new Set();
    if (!allSelected) {
      allLabels.forEach((l) => updated.add(l));
    }
    setSelected(updated);
  };

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
