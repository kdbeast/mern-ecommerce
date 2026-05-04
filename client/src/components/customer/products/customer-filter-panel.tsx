import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BRAND_OPTIONS,
  getSwatchColor,
  type CustomerProductFilters,
  type FacetKey,
} from "@/features/customer/products/product-list-shared";
import { SIZE_OPTIONS } from "@/features/admin/products/constants";
import type { ProductCategory } from "@/features/admin/products/types";

const sectionClass = "space-y-3";
const stackedOptionsClass = "space-y-1";
const colorSwatchBaseClass = "h-8 w-8 border";
const sizesWrapClass = "flex flex-wrap gap-2";
const colorsWrapClass = "flex flex-wrap gap-3";
const colorButtonActiveClass = "text-foreground";
const colorSwatchInactiveClass = "border-border";
const titleClass = "text-base font-semibold text-foreground";
const sectionTitleClass = "text-sm font-medium text-foreground";
const panelHeaderClass = "flex items-center justify-between gap-3";
const colorSwatchActiveClass = "border-primary ring-2 ring-primary/30";
const panelWrapClass = "space-y-6 overflow-y-auto px-4 py-2 lg:px-0 lg:py-0";
const fullWidthButtonClass = "w-full justify-start rounded-none cursor-pointer";
const clearButtonClass =
  "rounded-none px-2 text-sm underline-offset-4 hover:underline cursor-pointer";
const colorButtonBaseClass =
  "flex flex-col items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground hover:scale-110 transition-transform duration-200 ease-in-out";

type CustomerFiltersPanelProps = {
  categories: ProductCategory[];
  filters: CustomerProductFilters;
  availableColors: string[];
  hasActiveFilters: boolean;
  onToggleFacet: (key: FacetKey, value: string) => void;
  onClearFilters: () => void;
};

function CustomerFiltersPanel({
  categories,
  filters,
  availableColors,
  hasActiveFilters,
  onClearFilters,
  onToggleFacet,
}: CustomerFiltersPanelProps) {
  return (
    <div className={panelWrapClass}>
      <div className={panelHeaderClass}>
        <div>
          <h2 className={titleClass}>Filters</h2>
        </div>
        {hasActiveFilters ? (
          <Button
            variant={"ghost"}
            onClick={onClearFilters}
            className={clearButtonClass}
          >
            Clear All
          </Button>
        ) : null}
      </div>

      <Separator />

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Categories</h3>

        <div className={stackedOptionsClass}>
          {categories.map((item) => {
            const isActive = filters.category === item._id;

            return (
              <Button
                key={item._id}
                type="button"
                className={fullWidthButtonClass}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onToggleFacet("category", item._id)}
              >
                {item.name}
              </Button>
            );
          })}
        </div>
      </section>
      <Separator />

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Brands</h3>
        <div className={stackedOptionsClass}>
          {BRAND_OPTIONS.map((brand) => {
            const isActive = filters.brand === brand;

            return (
              <Button
                key={brand}
                type="button"
                variant={isActive ? "default" : "ghost"}
                className={fullWidthButtonClass}
                onClick={() => onToggleFacet("brand", brand)}
              >
                {brand}
              </Button>
            );
          })}
        </div>
      </section>
      <Separator />

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Colors</h3>
        <div className={colorsWrapClass}>
          {availableColors.map((color) => {
            const isActive = filters.color === color;

            return (
              <button
                key={color}
                type="button"
                className={`${colorButtonBaseClass} ${
                  isActive ? colorButtonActiveClass : ""
                }`}
                onClick={() => onToggleFacet("color", color)}
              >
                <span
                  className={`${colorSwatchBaseClass} ${
                    isActive ? colorSwatchActiveClass : colorSwatchInactiveClass
                  }`}
                  style={{ backgroundColor: getSwatchColor(color) }}
                />
              </button>
            );
          })}
        </div>
      </section>
      <Separator />

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Sizes</h3>
        <div className={sizesWrapClass}>
          {SIZE_OPTIONS.map((size) => {
            const isActive = filters.size === size;

            return (
              <Button
                key={size}
                type="button"
                className={fullWidthButtonClass}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onToggleFacet("size", size)}
              >
                {size}
              </Button>
            );
          })}
        </div>
      </section>
      <Separator />
    </div>
  );
}

export default CustomerFiltersPanel;
