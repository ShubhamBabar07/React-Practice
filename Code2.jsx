import * as React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";

const products = [
    {
        ProductID: 1,
        ProductName: "Chai",
        UnitPrice: 18.0,
        UnitsInStock: 39,
        Category: { CategoryID: 1, CategoryName: "Beverages" },
    },
    {
        ProductID: 2,
        ProductName: "Chang",
        UnitPrice: 19.0,
        UnitsInStock: 17,
        Category: { CategoryID: 1, CategoryName: "Beverages" },
    },
    {
        ProductID: 3,
        ProductName: "Aniseed Syrup",
        UnitPrice: 10.0,
        UnitsInStock: 13,
        Category: { CategoryID: 2, CategoryName: "Condiments" },
    },
];

// Group products by category
const groupByCategory = () => {
    const map = new Map();
    for (const p of products) {
        const cat = p.Category;
        if (!map.has(cat.CategoryID)) {
            map.set(cat.CategoryID, {
                ...cat,
                products: [],
                expanded: false,
            });
        }
        map.get(cat.CategoryID).products.push(p);
    }
    return Array.from(map.values());
};

const CategoryProductGrid = () => {
    const [categories, setCategories] = React.useState(groupByCategory());
    const [selectedIds, setSelectedIds] = React.useState({});

    const toggleCategoryExpand = (id) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.CategoryID === id
                    ? { ...cat, expanded: !cat.expanded }
                    : cat
            )
        );
    };

    const isProductSelected = (id) => selectedIds[id];

    const toggleProductSelect = (product, checked) => {
        const updated = { ...selectedIds };
        if (checked) updated[product.ProductID] = true;
        else delete updated[product.ProductID];
        setSelectedIds(updated);
    };

    const isCategoryFullySelected = (category) =>
        category.products.every((p) => selectedIds[p.ProductID]);

    const isCategoryPartiallySelected = (category) => {
        const selectedCount = category.products.filter(
            (p) => selectedIds[p.ProductID]
        ).length;
        return selectedCount > 0 && selectedCount < category.products.length;
    };

    const toggleCategorySelect = (category, checked) => {
        const updated = { ...selectedIds };
        for (const p of category.products) {
            if (checked) updated[p.ProductID] = true;
            else delete updated[p.ProductID];
        }
        setSelectedIds(updated);
    };

    const allProducts = categories.flatMap((cat) => cat.products);
    const areAllSelected = allProducts.every((p) => selectedIds[p.ProductID]);
    const isPartiallySelected =
        allProducts.some((p) => selectedIds[p.ProductID]) && !areAllSelected;

    const toggleSelectAll = (checked) => {
        const updated = {};
        if (checked) {
            allProducts.forEach((p) => {
                updated[p.ProductID] = true;
            });
        }
        setSelectedIds(checked ? updated : {});
    };

    const DetailComponent = (props) => {
        const category = props.dataItem;
        return (
            <Grid data={category.products}>
                <GridColumn
                    field="selected"
                    width="50px"
                    title=""
                    cell={(props) => {
                        const product = props.dataItem;
                        const checked = isProductSelected(product.ProductID);
                        return (
                            <td>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) =>
                                        toggleProductSelect(
                                            product,
                                            e.target.checked
                                        )
                                    }
                                />
                            </td>
                        );
                    }}
                />
                <GridColumn field="ProductName" title="Product Name" />
                <GridColumn field="UnitPrice" title="Unit Price" />
                <GridColumn field="UnitsInStock" title="In Stock" />
            </Grid>
        );
    };

    return (
        <>
            <Grid
                data={categories}
                detail={DetailComponent}
                expandField="expanded"
                onExpandChange={(e) =>
                    toggleCategoryExpand(e.dataItem.CategoryID)
                }
            >
                <GridColumn
                    field="select"
                    width="50px"
                    title=""
                    headerCell={() => (
                        <th>
                            <input
                                type="checkbox"
                                checked={areAllSelected}
                                ref={(el) => {
                                    if (el)
                                        el.indeterminate = isPartiallySelected;
                                }}
                                onChange={(e) =>
                                    toggleSelectAll(e.target.checked)
                                }
                            />
                        </th>
                    )}
                    cell={(props) => {
                        const cat = props.dataItem;
                        const fullySelected = isCategoryFullySelected(cat);
                        const partiallySelected =
                            isCategoryPartiallySelected(cat);
                        return (
                            <td>
                                <input
                                    type="checkbox"
                                    checked={fullySelected}
                                    ref={(el) => {
                                        if (el)
                                            el.indeterminate =
                                                partiallySelected;
                                    }}
                                    onChange={(e) =>
                                        toggleCategorySelect(
                                            cat,
                                            e.target.checked
                                        )
                                    }
                                />
                            </td>
                        );
                    }}
                />
                <GridColumn field="CategoryName" title="Category" />
                <GridColumn
                    field="Description"
                    title="Description"
                    cell={() => <td>Click row to expand products</td>}
                />
            </Grid>

            <div style={{ marginTop: "1rem" }}>
                <strong>Selected Products:</strong>{" "}
                {allProducts
                    .filter((p) => selectedIds[p.ProductID])
                    .map((p) => p.ProductName)
                    .join(", ") || "None"}
            </div>
        </>
    );
};

export default CategoryProductGrid;
