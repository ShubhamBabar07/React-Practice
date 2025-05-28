import React, { useState } from "react";
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

// Group products by Category
const groupProductsByCategory = () => {
    const map = {};
    products.forEach((p) => {
        const catId = p.Category.CategoryID;
        if (!map[catId]) {
            map[catId] = {
                CategoryID: catId,
                CategoryName: p.Category.CategoryName,
                expanded: false,
                products: [],
            };
        }
        map[catId].products.push(p);
    });
    return Object.values(map);
};

const CategoryProductGrid = () => {
    const [categories, setCategories] = useState(groupProductsByCategory());
    const [selectedProducts, setSelectedProducts] = useState({});

    // Helper to get all products
    const allProducts = categories.flatMap((cat) => cat.products);

    // Toggle expand/collapse
    const toggleExpand = (catId) => {
        setCategories((prev) =>
            prev.map((cat) =>
                cat.CategoryID === catId
                    ? { ...cat, expanded: !cat.expanded }
                    : cat
            )
        );
    };

    // Check if a product is selected
    const isProductSelected = (id) => selectedProducts[id];

    // Toggle product checkbox
    const toggleProduct = (productId, checked) => {
        setSelectedProducts((prev) => {
            const updated = { ...prev };
            if (checked) updated[productId] = true;
            else delete updated[productId];
            return updated;
        });
    };

    // Select/deselect all products in a category
    const toggleCategory = (category, checked) => {
        const updated = { ...selectedProducts };
        category.products.forEach((p) => {
            if (checked) updated[p.ProductID] = true;
            else delete updated[p.ProductID];
        });
        setSelectedProducts(updated);
    };

    // Is category fully selected?
    const isCategorySelected = (category) =>
        category.products.every((p) => selectedProducts[p.ProductID]);

    // Is category partially selected?
    const isCategoryPartial = (category) => {
        const selectedCount = category.products.filter(
            (p) => selectedProducts[p.ProductID]
        ).length;
        return selectedCount > 0 && selectedCount < category.products.length;
    };

    // Select all products
    const toggleSelectAll = (checked) => {
        if (checked) {
            const all = {};
            allProducts.forEach((p) => {
                all[p.ProductID] = true;
            });
            setSelectedProducts(all);
        } else {
            setSelectedProducts({});
        }
    };

    const isAllSelected = allProducts.every(
        (p) => selectedProducts[p.ProductID]
    );
    const isSomeSelected =
        allProducts.some((p) => selectedProducts[p.ProductID]) &&
        !isAllSelected;

    // Detail row for products
    const ProductGrid = ({ products }) => (
        <Grid data={products}>
            <GridColumn
                width="50px"
                title=""
                cell={(props) => {
                    const product = props.dataItem;
                    return (
                        <td>
                            <input
                                type="checkbox"
                                checked={!!isProductSelected(product.ProductID)}
                                onChange={(e) =>
                                    toggleProduct(
                                        product.ProductID,
                                        e.target.checked
                                    )
                                }
                            />
                        </td>
                    );
                }}
            />
            <GridColumn field="ProductName" title="Product" />
            <GridColumn field="UnitPrice" title="Price" />
            <GridColumn field="UnitsInStock" title="Stock" />
        </Grid>
    );

    return (
        <div>
            <Grid
                data={categories}
                expandField="expanded"
                onExpandChange={(e) => toggleExpand(e.dataItem.CategoryID)}
                detail={(props) => (
                    <ProductGrid products={props.dataItem.products} />
                )}
            >
                <GridColumn
                    width="50px"
                    title=""
                    headerCell={() => (
                        <th>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = isSomeSelected;
                                }}
                                onChange={(e) =>
                                    toggleSelectAll(e.target.checked)
                                }
                            />
                        </th>
                    )}
                    cell={(props) => {
                        const cat = props.dataItem;
                        const full = isCategorySelected(cat);
                        const partial = isCategoryPartial(cat);
                        return (
                            <td>
                                <input
                                    type="checkbox"
                                    checked={full}
                                    ref={(el) => {
                                        if (el) el.indeterminate = partial;
                                    }}
                                    onChange={(e) =>
                                        toggleCategory(cat, e.target.checked)
                                    }
                                />
                            </td>
                        );
                    }}
                />
                <GridColumn field="CategoryName" title="Category" />
                <GridColumn
                    title="Expand"
                    cell={() => <td>Click row to expand products</td>}
                />
            </Grid>

            <div style={{ marginTop: "1rem" }}>
                <strong>Selected Products:</strong>{" "}
                {allProducts
                    .filter((p) => selectedProducts[p.ProductID])
                    .map((p) => p.ProductName)
                    .join(", ") || "None"}
            </div>
        </div>
    );
};

export default CategoryProductGrid;
