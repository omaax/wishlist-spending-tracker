"use client"

import { useState } from "react"
import { useCategories, useAddCategory, useDeleteCategory } from "@/lib/query-hooks"
import { DEFAULT_CATEGORIES } from "@/lib/constants"
import { sortCategories } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/types"

const CATEGORY_COLORS = ["#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"]

function CategoryManager() {
  const { data: customCategories } = useCategories()
  const addCategory = useAddCategory()
  const deleteCategory = useDeleteCategory()
  const categories = sortCategories(customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_CATEGORIES)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  return (
    <>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {categories.map((cat) => {
          const isDefault = DEFAULT_CATEGORIES.some((d) => d.id === cat.id)
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
                {isDefault && (
                  <span className="text-xs text-muted-foreground">(default)</span>
                )}
              </div>
              {!isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => setDeleteTarget(cat)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <hr className="border-t" />
      <div className="flex gap-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (newCategoryName.trim()) {
              const id = newCategoryName.toLowerCase().replace(/\s+/g, "-")
              const color = CATEGORY_COLORS[(customCategories?.length ?? 0) % CATEGORY_COLORS.length]
              addCategory.mutate({ id, name: newCategoryName.trim(), color })
              setNewCategoryName("")
              toast.success(`Category "${newCategoryName.trim()}" added`)
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All items in this category will also be deleted.`}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory.mutate(deleteTarget.id)
            toast.success(`Category "${deleteTarget.name}" deleted`)
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )
}

export { CategoryManager }
