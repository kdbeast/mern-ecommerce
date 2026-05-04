import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CommonLoader } from "@/components/common/Loader";
import type { ProductSort } from "@/features/customer/products/types";
import CustomerProductCard from "@/components/customer/products/customer-product-card";
import CustomerFiltersPanel from "@/components/customer/products/customer-filter-panel";
import { useCustomerProductList } from "@/features/customer/products/use-customer-collections";

const heroTitleWrapClass = "space-y-2";
const productSectionClass = "space-y-6";
const mobileSheetHeaderClass = "sr-only";
const actionButtonClass = "rounded-none";
const desktopAsideClass = "hidden lg:block";
const mobileFilterIconClass = "mr-2 h-4 w-4";
const pageWrapClass = "min-h-screen bg-background";
const emptyCardClass = "border-border/60 bg-card/80";
const topBarActionsClass = "flex items-center gap-3";
const mobileFilterButtonClass = "rounded-none lg:hidden";
const heroContainerClass = "mx-auto max-w-7xl px-4 py-10";
const sortTriggerClass = "w-[180px] rounded-none bg-card";
const contentContainerClass = "mx-auto max-w-7xl px-4 py-2";
const emptyTitleClass = "text-xl font-semibold text-foreground";
const activeBadgesWrapClass = "flex flex-wrap items-center gap-2";
const productGridClass = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";
const layoutGridClass = "grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]";
const heroEyebrowClass = "text-sm uppercase tracking-[0.2em] text-primary";
const sortWrapClass = "flex items-center gap-3 text-sm text-muted-foreground";
const mobileSheetContentClass = "w-full max-w-sm border-border bg-background";
const desktopFilterCardClass = "sticky top-24 border-border/60 bg-card/80 p-5";
const heroContentClass =
  "mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between";
const activeBadgeClass =
  "border-border bg-secondary text-secondary-foreground hover:bg-secondary";
const topBarClass =
  "mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between";
const emptyCardContentClass =
  "flex min-h-60 flex-col items-center justify-center gap-4 p-6 text-center";
const heroTitleClass =
  "text-2xl font-semibold tracking-tight text-foreground md:text-3xl lg:text-4xl";
const heroSectionClass =
  "border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background";

function Collections() {
  const {
    sort,
    changeSort,
    loading,
    products,
    hasActiveFilters,
    categories,
    availableColors,
    filters,
    toggleFacet,
    clearFilters,
    activeFilterBadges,
  } = useCustomerProductList();

    if (loading) return <CommonLoader />;

  return (
    <div className={pageWrapClass}>
      <section className={heroSectionClass}>
        <div className={heroContainerClass}>
          <p className={heroEyebrowClass}>New Collections</p>

          <div className={heroContentClass}>
            <div className={heroTitleWrapClass}>
              <h1 className={heroTitleClass}>Premium everyday essentials</h1>
            </div>

            <div className={sortWrapClass}>
              <Select
                value={sort}
                onValueChange={(value) => changeSort(value as ProductSort)}
              >
                <SelectTrigger className={sortTriggerClass}>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="recent">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <div className={contentContainerClass}>
        <div className={topBarClass}>
          <div className={activeBadgesWrapClass}>
            {activeFilterBadges.map((item) => (
              <Badge key={item.key} className={activeBadgeClass}>
                {item.label}: {item.value}
              </Badge>
            ))}
          </div>

          {/* mobile sheet component */}
          <div className={topBarActionsClass}>
            <Sheet>
              <SheetTrigger asChild>
                <Button className={mobileFilterButtonClass}>
                  <SlidersHorizontal className={mobileFilterIconClass} />
                  Filers
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className={mobileSheetContentClass}>
                <SheetHeader className={mobileSheetHeaderClass}>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <CustomerFiltersPanel
                  categories={categories}
                  filters={filters}
                  availableColors={availableColors}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  onToggleFacet={toggleFacet}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className={layoutGridClass}>
          <aside className={desktopAsideClass}>
            <Card className={desktopFilterCardClass}>
              <CustomerFiltersPanel
                categories={categories}
                filters={filters}
                availableColors={availableColors}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onToggleFacet={toggleFacet}
              />
            </Card>
          </aside>

          <section className={productSectionClass}>
            {!loading && !products.length ? (
              <Card className={emptyCardClass}>
                <CardContent className={emptyCardContentClass}>
                  <p className={emptyTitleClass}>No Products Found</p>
                  {hasActiveFilters ? (
                    <Button
                      onClick={clearFilters}
                      className={actionButtonClass}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {!loading && products.length ? (
              <div className={productGridClass}>
                {products.map((item) => (
                  <CustomerProductCard key={item._id} product={item} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Collections;
