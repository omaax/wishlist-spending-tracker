"use client";

import { useState } from "react";
import type { WishlistItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  HeartOff,
  ShoppingCart,
  Trash2,
  Pencil,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { PRIORITIES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

interface WishlistCardProps {
  item: WishlistItem;
  onTogglePurchased: () => void;
  onDelete: () => void;
}

export function WishlistCard({
  item,
  onTogglePurchased,
  onDelete,
}: WishlistCardProps) {
  const priority = PRIORITIES.find((p) => p.value === item.priority);
  const images = item.images ?? [];
  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col">
      {images.length > 0 && (
        <div className="relative h-46 w-full bg-muted cursor-pointer" onClick={() => setLightboxOpen(true)}>
          <Image
            src={images[imgIndex].blob}
            alt={item.name}
            fill
            className="object-cover"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex((p) => (p === 0 ? images.length - 1 : p - 1));
                }}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex((p) => (p === images.length - 1 ? 0 : p + 1));
                }}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === imgIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <CardContent className="px-4 py-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{item.name}</h3>
              {/* {item.isFavorite && (
                <Heart className="h-4 w-4 fill-red-500 text-red-500 shrink-0" />
              )} */}
            </div>
            {item.price !== undefined ? (
              <p className="text-xl font-bold">{formatCurrency(item.price)}</p>
            ) : (
              <p className="text-xs text-muted-foreground">No price set</p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {priority && (
              <Badge variant="outline" className={priority.color}>
                {priority.label}
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize text-xs">
              {item.category}
            </Badge>
          </div>
        </div>
        {item.notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {item.notes}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Added {formatDate(item.createdAt)}
          {item.isPurchased && item.purchasedAt && (
            <> &middot; Purchased {formatDate(item.purchasedAt)}</>
          )}
        </p>
      </CardContent>
      <CardFooter className="p-1 flex flex-wrap gap-1 items-center mt-auto">
        {/* <Button
          variant="ghost"
          size="sm"
          className={`h-7 ${item.isFavorite ? "text-red-500" : ""}`}
          onClick={onToggleFavorite}
        >
          {item.isFavorite ? (
            <HeartOff className="h-3.5 w-3.5" />
          ) : (
            <Heart className="h-3.5 w-3.5" />
          )}
        </Button> */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 ${item.isPurchased ? "text-green-500" : ""}`}
          onClick={onTogglePurchased}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>
        <Link href={`/wishlist/${item.id}`}>
          <Button variant="ghost" size="sm" className="h-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Link>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-7">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxOpen(false)}
        >
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="fixed left-4 top-1/2 -translate-y-1/2 h-12 w-12 z-10"
                onClick={(e) => { e.stopPropagation(); setImgIndex((p) => (p === 0 ? images.length - 1 : p - 1)); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="fixed right-4 top-1/2 -translate-y-1/2 h-12 w-12 z-10"
                onClick={(e) => { e.stopPropagation(); setImgIndex((p) => (p === images.length - 1 ? 0 : p + 1)); }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[imgIndex].blob}
              alt={item.name}
              width={1200}
              height={1200}
              className="rounded-lg object-contain max-h-[85vh] w-auto h-auto"
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === imgIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
