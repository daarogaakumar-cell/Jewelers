"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Grid3X3,
  CircleDollarSign,
  Gem,
  Plus,
  BarChart3,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { STALE_PRICE_HOURS } from "@/constants";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalMetals: number;
  totalGemstones: number;
  recentProducts: Array<{
    _id: string;
    name: string;
    productCode: string;
    totalPrice: number;
    category?: { name: string };
    createdAt: string;
    isNewArrival: boolean;
    isOutOfStock: boolean;
  }>;
  metalPrices: Array<{
    _id: string;
    name: string;
    variants: Array<{
      name: string;
      pricePerGram: number;
      unit: string;
      lastUpdated?: string;
    }>;
    updatedAt: string;
  }>;
  gemstonePrices: Array<{
    _id: string;
    name: string;
    variants: Array<{
      name: string;
      pricePerCarat: number;
      unit: string;
      lastUpdated?: string;
    }>;
    updatedAt: string;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-card-hover transition-shadow duration-200 cursor-pointer h-full">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal-400 mb-1">{title}</p>
              <p className="text-2xl md:text-3xl font-heading font-bold text-charcoal-700">
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl",
                color
              )}
            >
              <Icon size={24} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function isPriceStale(updatedAt?: string): boolean {
  if (!updatedAt) return true;
  const hoursAgo =
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
  return hoursAgo > STALE_PRICE_HOURS;
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes, metalsRes, gemstonesRes] =
        await Promise.all([
          fetch("/api/products?limit=5&sort=-createdAt"),
          fetch("/api/categories"),
          fetch("/api/metals"),
          fetch("/api/gemstones"),
        ]);

      const [productsData, categoriesData, metalsData, gemstonesData] =
        await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          metalsRes.json(),
          gemstonesRes.json(),
        ]);

      setStats({
        totalProducts: productsData.pagination?.total || productsData.data?.length || 0,
        totalCategories: categoriesData.data?.length || 0,
        totalMetals: metalsData.data?.length || 0,
        totalGemstones: gemstonesData.data?.length || 0,
        recentProducts: productsData.data || [],
        metalPrices: metalsData.data || [],
        gemstonePrices: gemstonesData.data || [],
      });
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-lg font-heading font-semibold text-charcoal-700 mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-sm text-charcoal-400 mb-4">{error}</p>
        <Button variant="primary" onClick={fetchDashboardData}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Stats grid */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          href="/admin/products"
          color="bg-gold-500/10 text-gold-600"
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={Grid3X3}
          href="/admin/categories"
          color="bg-info/10 text-info"
        />
        <StatCard
          title="Metals"
          value={stats?.totalMetals || 0}
          icon={CircleDollarSign}
          href="/admin/metals"
          color="bg-success/10 text-success"
        />
        <StatCard
          title="Gemstones"
          value={stats?.totalGemstones || 0}
          icon={Gem}
          href="/admin/gemstones"
          color="bg-rose-500/10 text-rose-500"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={staggerItem}>
        <Card>
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-heading font-semibold text-charcoal-700 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/products/new">
                <Button variant="primary" size="md">
                  <Plus size={18} />
                  Add Product
                </Button>
              </Link>
              <Link href="/admin/pricing">
                <Button variant="secondary" size="md">
                  <BarChart3 size={18} />
                  Update Prices
                </Button>
              </Link>
              <Link href="/admin/categories/new">
                <Button variant="outline" size="md">
                  <Plus size={18} />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current prices */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Prices</CardTitle>
                <Link
                  href="/admin/pricing"
                  className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4">
              {/* Metal prices */}
              {stats?.metalPrices && stats.metalPrices.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    Metals
                  </h4>
                  {stats.metalPrices.map((metal) => (
                    <div key={metal._id} className="space-y-2">
                      {metal.variants.slice(0, 3).map((variant) => (
                        <div
                          key={`${metal._id}-${variant.name}`}
                          className="flex items-center justify-between py-2 border-b border-charcoal-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal-600">
                              {metal.name} {variant.name}
                            </span>
                            {isPriceStale(
                              variant.lastUpdated || metal.updatedAt
                            ) && (
                              <Badge variant="warning" size="sm">
                                Stale
                              </Badge>
                            )}
                          </div>
                          <PriceDisplay
                            amount={variant.pricePerGram}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal-400 py-2">
                  No metals added yet
                </p>
              )}

              {/* Gemstone prices */}
              {stats?.gemstonePrices && stats.gemstonePrices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    Gemstones
                  </h4>
                  {stats.gemstonePrices.map((gemstone) => (
                    <div key={gemstone._id} className="space-y-2">
                      {gemstone.variants.slice(0, 2).map((variant) => (
                        <div
                          key={`${gemstone._id}-${variant.name}`}
                          className="flex items-center justify-between py-2 border-b border-charcoal-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal-600">
                              {gemstone.name} {variant.name}
                            </span>
                            {isPriceStale(
                              variant.lastUpdated || gemstone.updatedAt
                            ) && (
                              <Badge variant="warning" size="sm">
                                Stale
                              </Badge>
                            )}
                          </div>
                          <PriceDisplay
                            amount={variant.pricePerCarat}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent products */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Products</CardTitle>
                <Link
                  href="/admin/products"
                  className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                <ul className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <li
                      key={product._id}
                      className="flex items-center justify-between py-2 border-b border-charcoal-50 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-charcoal-700 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-charcoal-400">
                            {product.productCode}
                          </span>
                          {product.category && (
                            <Badge variant="default" size="sm">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.isNewArrival && (
                            <Badge variant="rose" size="sm">
                              New
                            </Badge>
                          )}
                          {product.isOutOfStock && (
                            <Badge variant="error" size="sm">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <PriceDisplay amount={product.totalPrice} size="sm" />
                        <p className="text-xs text-charcoal-400 flex items-center gap-1 mt-0.5 justify-end">
                          <Clock size={10} />
                          {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-charcoal-200 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-400 mb-3">
                    No products added yet
                  </p>
                  <Link href="/admin/products/new">
                    <Button variant="primary" size="sm">
                      <Plus size={16} />
                      Add First Product
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-4 md:p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <div className="p-4 md:p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 md:p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="p-4 md:p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
