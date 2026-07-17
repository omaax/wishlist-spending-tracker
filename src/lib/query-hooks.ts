"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as db from "./db";
import type { WishlistItem, Category, Budget, PurchaseRecord } from "./types";

// Wishlist Items
export function useItems() {
  return useQuery({ queryKey: ["items"], queryFn: db.getAllItems });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: async () => {
      const item = await db.getItem(id);
      return item ?? null;
    },
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: WishlistItem) => db.addItem(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: WishlistItem) => db.updateItem(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

// Categories
export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: db.getAllCategories });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cat: Category) => db.addCategory(cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// Budgets
export function useBudgets() {
  return useQuery({ queryKey: ["budgets"], queryFn: db.getAllBudgets });
}

export function useAddBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budget: Budget) => db.addBudget(budget),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

// Purchase History
export function usePurchaseHistory() {
  return useQuery({
    queryKey: ["purchaseHistory"],
    queryFn: db.getAllPurchaseHistory,
  });
}

export function useAddPurchaseRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record: PurchaseRecord) => db.addPurchaseRecord(record),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchaseHistory"] }),
  });
}

export function useDeletePurchaseRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deletePurchaseRecord(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchaseHistory"] }),
  });
}
