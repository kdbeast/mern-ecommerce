import {
  getAdminPromos,
  createAdminPromo,
  deleteAdminPromo,
  updateAdminPromo,
} from "./api";
import { useEffect, useMemo, useState } from "react";
import type { Promo, PromoFormValues } from "./types";

export function useAdminPromos() {
  const [search, setSearch] = useState("");
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [deletingPromoId, setDeletingPromoId] = useState("");
  const [saving, setSaving] = useState(false);

  const refreshAll = async () => {
    try {
      setLoading(true);

      const response = await getAdminPromos();
      setPromos((response ?? { items: [] }).items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  const filteredPromos = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return promos;

    return promos.filter((promo) => promo.code.toLowerCase().includes(query));
  }, [promos, search]);

  const openCreateDialog = () => {
    setEditingPromo(null);
    setPromoDialogOpen(true);
  };

  const closePromoDialog = () => {
    setEditingPromo(null);
    setPromoDialogOpen(false);
  };

  const openEditDialog = (promo: Promo) => {
    setEditingPromo(promo);
    setPromoDialogOpen(true);
  };

  const savePromo = async (values: PromoFormValues) => {
    try {
      setSaving(true);

      const response = editingPromo
        ? await updateAdminPromo(editingPromo?._id, values)
        : await createAdminPromo(values);

      setPromos((response ?? { items: [] })?.items);
    } finally {
      setSaving(false);
    }
  };

  const removePromo = async (promoId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promo?",
    );

    if (!confirmed) return;

    try {
      setDeletingPromoId(promoId);

      const response = await deleteAdminPromo(promoId);
      setPromos((response ?? { items: [] }).items);
    } finally {
      setDeletingPromoId("");
    }
  };

  return {
    search,
    setSearch,
    promos: filteredPromos,
    loading,
    promoDialogOpen,
    setPromoDialogOpen,
    editingPromo,
    openCreateDialog,
    closePromoDialog,
    refreshAll,
    savePromo,
    removePromo,
    saving,
    deletingPromoId,
    openEditDialog,
  };
}
